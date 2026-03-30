import React, { useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type PaymentType = "tip" | "membership" | "product" | "wishlist" | "subscription";
type SubscriptionPlan = "shop" | "premium";

interface PaystackPaymentProps {
  email: string;
  amount: number;
  type: PaymentType;
  creatorId?: Id<"creators">;
  userId: Id<"users">;
  itemId?: string;
  itemName?: string;
  subscriptionPlan?: SubscriptionPlan;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  children: (props: { loading: boolean; handlePayment: () => void }) => React.ReactNode;
  key?: React.Key;
}

interface PendingPaymentPayload {
  reference: string;
  email: string;
  amount: number;
  type: PaymentType;
  userId: string;
  creatorId?: string;
  itemId?: string;
  itemName?: string;
  subscriptionPlan?: SubscriptionPlan;
}

const PENDING_PAYMENT_KEY = "dropsomething.pendingPaystackPayment";

const parsePendingPayment = (): PendingPaymentPayload | null => {
  const rawPayment = sessionStorage.getItem(PENDING_PAYMENT_KEY);
  if (!rawPayment) {
    return null;
  }

  try {
    return JSON.parse(rawPayment) as PendingPaymentPayload;
  } catch {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    return null;
  }
};

const clearPendingPayment = () => {
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
};

const clearPaymentQueryParams = () => {
  const url = new URL(window.location.href);
  let hasChanges = false;

  for (const key of ["reference", "trxref", "status"]) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, nextUrl);
  }
};

const getCallbackUrl = () => {
  const url = new URL(window.location.href);
  for (const key of ["reference", "trxref", "status"]) {
    url.searchParams.delete(key);
  }
  return url.toString();
};

const requiresCreator = (type: PaymentType) => type === "tip" || type === "membership";
const requiresItem = (type: PaymentType) => type === "product" || type === "wishlist";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        metadata: {
          custom_fields: Array<{
            display_name: string;
            variable_name: string;
            value: string;
          }>;
        };
        callback: (response: { reference?: string }) => void | Promise<void>;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export function PaystackPayment({
  email,
  amount,
  type,
  creatorId,
  userId,
  itemId,
  itemName,
  subscriptionPlan,
  onSuccess,
  onError,
  children,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);
  const completionInFlight = useRef(false);

  const generateReference = useQuery(api.paystack.generateReference);
  const initializePayment = useAction(api.paystack.initializePayment);
  const verifyPayment = useAction(api.paystack.verifyPayment);
  const fulfillPayment = useMutation(api.paystack.fulfillPayment);

  const buildPendingPayload = (reference: string): PendingPaymentPayload => ({
    reference,
    email,
    amount,
    type,
    userId: userId.toString(),
    creatorId: creatorId?.toString(),
    itemId,
    itemName,
    subscriptionPlan,
  });

  const matchesComponent = (pendingPayment: PendingPaymentPayload) =>
    pendingPayment.type === type &&
    pendingPayment.userId === userId.toString() &&
    pendingPayment.creatorId === creatorId?.toString() &&
    pendingPayment.itemId === itemId &&
    pendingPayment.subscriptionPlan === subscriptionPlan;

  const finishPayment = async (reference: string, pendingPayment: PendingPaymentPayload) => {
    try {
      const verification = await verifyPayment({ reference });
      if (!verification.success || verification.status !== "success") {
        throw new Error(verification.message || "Payment verification failed");
      }

      await fulfillPayment({
        reference,
        type: pendingPayment.type,
        amount: pendingPayment.amount,
        email: pendingPayment.email,
        userId,
        creatorId,
        itemId: pendingPayment.itemId,
        subscriptionPlan: pendingPayment.subscriptionPlan,
      });

      onSuccess?.(reference);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment verification failed";
      onError?.(message);
    } finally {
      clearPendingPayment();
      clearPaymentQueryParams();
      setLoading(false);
      completionInFlight.current = false;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    const status = params.get("status");
    const pendingPayment = parsePendingPayment();

    if (!reference || !pendingPayment || completionInFlight.current) {
      return;
    }

    if (pendingPayment.reference !== reference || !matchesComponent(pendingPayment)) {
      return;
    }

    completionInFlight.current = true;
    setLoading(true);

    if (status && status !== "success" && status !== "successful") {
      onError?.("Payment was not completed");
      clearPendingPayment();
      clearPaymentQueryParams();
      setLoading(false);
      completionInFlight.current = false;
      return;
    }

    void finishPayment(reference, pendingPayment);
  }, [creatorId, itemId, onError, subscriptionPlan, type, userId]);

  const launchRedirectFlow = async (pendingPayment: PendingPaymentPayload) => {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pendingPayment));

    try {
      const initialized = await initializePayment({
        email,
        amount,
        reference: pendingPayment.reference,
        callbackUrl: getCallbackUrl(),
        metadata: {
          type,
          creatorId: creatorId?.toString(),
          userId: userId.toString(),
          itemId,
          subscriptionPlan,
        },
      });

      window.location.assign(initialized.authorizationUrl);
    } catch (error) {
      clearPendingPayment();
      throw error;
    }
  };

  const ensureInlineScript = async () => {
    await new Promise<void>((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  };

  const launchInlineFlow = async (publicKey: string, pendingPayment: PendingPaymentPayload) => {
    await ensureInlineScript();

    const handler = window.PaystackPop?.setup({
      key: publicKey,
      email,
      amount: amount * 100,
      ref: pendingPayment.reference,
      metadata: {
        custom_fields: [
          { display_name: "type", variable_name: "type", value: type },
          { display_name: "creatorId", variable_name: "creatorId", value: creatorId?.toString() || "" },
          { display_name: "userId", variable_name: "userId", value: userId.toString() },
          { display_name: "itemId", variable_name: "itemId", value: itemId || "" },
          { display_name: "itemName", variable_name: "itemName", value: itemName || "" },
          { display_name: "subscriptionPlan", variable_name: "subscriptionPlan", value: subscriptionPlan || "" },
        ],
      },
      callback: async (response) => {
        sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pendingPayment));
        completionInFlight.current = true;
        setLoading(true);
        await finishPayment(response.reference || pendingPayment.reference, pendingPayment);
      },
      onClose: () => {
        setLoading(false);
        if (!completionInFlight.current) {
          onError?.("Payment popup closed");
        }
      },
    });

    if (!handler) {
      throw new Error("Paystack popup could not be opened");
    }

    handler.openIframe();
  };

  const handlePayment = async () => {
    if (!email || !amount || amount <= 0) {
      onError?.("Invalid payment details");
      return;
    }

    if (requiresCreator(type) && !creatorId) {
      onError?.("Creator payment details are missing");
      return;
    }

    if (requiresItem(type) && !itemId) {
      onError?.("The selected item is missing");
      return;
    }

    setLoading(true);

    try {
      const reference =
        generateReference ||
        `DS_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const pendingPayment = buildPendingPayload(reference);
      const publicKey = (import.meta as ImportMeta & {
        env?: { VITE_PAYSTACK_PUBLIC_KEY?: string };
      }).env?.VITE_PAYSTACK_PUBLIC_KEY;

      if (publicKey) {
        try {
          await launchInlineFlow(publicKey, pendingPayment);
          return;
        } catch (error) {
          console.warn("Paystack inline flow failed, falling back to redirect flow:", error);
        }
      }

      await launchRedirectFlow(pendingPayment);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      onError?.(message);
      setLoading(false);
      completionInFlight.current = false;
    }
  };

  return children({ loading, handlePayment });
}

export function usePaystack() {
  const generateReference = useQuery(api.paystack.generateReference);
  const initializePayment = useAction(api.paystack.initializePayment);
  const verifyPayment = useAction(api.paystack.verifyPayment);

  return {
    generateReference,
    initializePayment,
    verifyPayment,
  };
}
