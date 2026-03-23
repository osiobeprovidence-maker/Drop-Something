import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  
  const generateReference = useQuery(api.paystack.node.generateReference);
  const initializePayment = useAction(api.paystack.node.initializePayment);
  const verifyPayment = useAction(api.paystack.node.verifyPayment);
  
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
      const reference = await generateReference();

      // Initialize payment with Paystack
      const result = await initializePayment({
        email,
        amount,
        reference,
        metadata: {
          type,
          creatorId: creatorId.toString(),
          userId: userId.toString(),
          itemId: itemId || "",
          itemName: itemName || "",
        },
      });

      // Open Paystack payment popup
      if (result.authorizationUrl) {
        const popup = window.open(result.authorizationUrl, "_blank");
        
        // Wait for payment callback (in production, use webhook)
        // For now, we'll poll for verification
        const verifyInterval = setInterval(async () => {
          try {
            const verification = await verifyPayment({ reference });
            
            if (verification.success && verification.status === "success") {
              clearInterval(verifyInterval);
              
              // Record the payment based on type
              switch (type) {
                case "tip":
                  await recordTip({
                    creatorId,
                    supporterName: userId.toString(),
                    amount,
                    message: "",
                    type: "tip",
                    paystackReference: reference,
                  });
                  break;
                  
                case "wishlist":
                  if (itemId) {
                    await recordContribution({
                      wishlistId: itemId as Id<"wishlists">,
                      amount,
                      paystackReference: reference,
                    });
                  }
                  break;
                  
                case "product":
                  if (itemId) {
                    await recordPurchase({
                      productId: itemId as Id<"products">,
                      buyerEmail: email,
                      amount,
                      paystackReference: reference,
                    });
                  }
                  break;
                  
                case "membership":
                  await createSubscription({
                    userId,
                    plan: "premium",
                    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
                    paystackReference: reference,
                  });
                  break;
              }
              
              onSuccess?.(reference);
              popup?.close();
            }
          } catch (error) {
            console.error("Verification error:", error);
          }
        }, 2000); // Check every 2 seconds

        // Stop polling after 2 minutes
        setTimeout(() => clearInterval(verifyInterval), 120000);
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError?.("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return children({ loading, handlePayment });
}

// Helper hook to use Paystack
export function usePaystack() {
  const generateReference = useQuery(api.paystack.node.generateReference);
  const initializePayment = useAction(api.paystack.node.initializePayment);
  const verifyPayment = useAction(api.paystack.node.verifyPayment);

  return {
    generateReference,
    initializePayment,
    verifyPayment,
  };
}
