import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import React from "react";

interface PaystackPaymentProps {
  email: string;
  amount: number;
  type: "tip" | "membership" | "product" | "wishlist";
  creatorId: Id<"creators">;
  userId: Id<"users">;
  itemId?: string;
  itemName?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  children: (props: { loading: boolean; handlePayment: () => void }) => React.ReactNode;
  key?: React.Key;
}

export function PaystackPayment({
  email,
  amount,
  type,
  creatorId,
  userId,
  itemId,
  itemName,
  onSuccess,
  onError,
  children,
}: PaystackPaymentProps) {
  const [loading, setLoading] = useState(false);

  const generateReference = useQuery(api.paystack.generateReference);
  const verifyPayment = useAction(api.paystack.verifyPayment);

  const recordTip = useMutation(api.paystack.recordTipPayment);
  const recordContribution = useMutation(api.paystack.recordWishlistContribution);
  const recordPurchase = useMutation(api.paystack.recordProductPurchase);
  const createSubscription = useMutation(api.paystack.createSubscription);

  const handlePayment = async () => {
    if (!email || !amount || amount <= 0) {
      onError?.("Invalid payment details");
      return;
    }

    setLoading(true);

    try {
      // Generate unique reference
      const reference = generateReference || `DS_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Use Paystack inline with public key for better UX
      const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || '';
      if (!publicKey) {
        throw new Error('Paystack public key not configured (VITE_PAYSTACK_PUBLIC_KEY)');
      }

      // Ensure Paystack inline script is loaded
      await new Promise<void>((resolve, reject) => {
        if ((window as any).PaystackPop) return resolve();
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Paystack script'));
        document.head.appendChild(script);
      });

      // Setup Paystack inline
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email,
        amount: amount * 100,
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: 'type', variable_name: 'type', value: type },
            { display_name: 'creatorId', variable_name: 'creatorId', value: creatorId.toString() },
            { display_name: 'userId', variable_name: 'userId', value: userId.toString() },
            { display_name: 'itemId', variable_name: 'itemId', value: itemId || '' },
            { display_name: 'itemName', variable_name: 'itemName', value: itemName || '' },
          ],
        },
        callback: async (response: any) => {
          try {
            const verification = await verifyPayment({ reference });
            if (verification.success && verification.status === 'success') {
              // Record server-side
              switch (type) {
                case 'tip':
                  await recordTip({
                    creatorId,
                    supporterName: userId.toString(),
                    amount,
                    message: '',
                    type: 'tip',
                    paystackReference: reference,
                  });
                  break;
                case 'wishlist':
                  if (itemId) {
                    await recordContribution({
                      wishlistId: itemId as Id<'wishlists'>,
                      amount,
                      paystackReference: reference,
                    });
                  }
                  break;
                case 'product':
                  if (itemId) {
                    await recordPurchase({
                      productId: itemId as Id<'products'>,
                      buyerEmail: email,
                      amount,
                      paystackReference: reference,
                    });
                  }
                  break;
                case 'membership':
                  await createSubscription({
                    userId,
                    plan: 'premium',
                    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
                    paystackReference: reference,
                  });
                  break;
              }

              onSuccess?.(reference);
            } else {
              onError?.(verification?.message || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            onError?.(err?.message || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        onClose: () => {
          onError?.('Payment popup closed');
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : String(error);
      onError?.(message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return children({ loading, handlePayment });
}

// Helper hook to use Paystack
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
