"use node";

import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize Paystack API
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Initialize a payment transaction
export const initializePayment = action({
  args: {
    email: v.string(),
    amount: v.number(),
    reference: v.string(),
    metadata: v.object({
      type: v.union(v.literal("tip"), v.literal("membership"), v.literal("product"), v.literal("wishlist")),
      creatorId: v.string(),
      userId: v.string(),
      itemId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: args.email,
          amount: args.amount * 100,
          reference: args.reference,
          metadata: args.metadata,
          callback: `${process.env.APP_URL || "http://localhost:3000"}/payment/callback`,
        }),
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || "Failed to initialize payment");
      }

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      };
    } catch (error) {
      console.error("Paystack initialization error:", error);
      throw new Error("Failed to initialize payment");
    }
  },
});

// Verify a payment transaction
export const verifyPayment = action({
  args: {
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${args.reference}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.status) {
        return {
          success: false,
          status: "failed",
          message: data.message,
        };
      }

      const transaction = data.data;
      
      return {
        success: transaction.status === "success",
        status: transaction.status,
        amount: transaction.amount / 100,
        email: transaction.customer.email,
        paidAt: transaction.paid_at,
        metadata: transaction.metadata,
      };
    } catch (error) {
      console.error("Paystack verification error:", error);
      return {
        success: false,
        status: "error",
        message: "Failed to verify payment",
      };
    }
  },
});

// Generate unique reference
export const generateReference = query({
  handler: async () => {
    return `DS_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  },
});
