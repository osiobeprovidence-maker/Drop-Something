import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize Paystack API
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// ==================== PAYMENT INITIALIZATION ====================

// Initialize a payment transaction
export const initializePayment = action({
  args: {
    email: v.string(),
    amount: v.number(), // Amount in kobo (₦1 = 100 kobo)
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
          amount: args.amount * 100, // Convert naira to kobo
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
        amount: transaction.amount / 100, // Convert kobo to naira
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

// ==================== SUBSCRIPTIONS ====================

// Create subscription for Pro plan
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("shop"), v.literal("premium")),
    expiresAt: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: "active",
        expiresAt: args.expiresAt,
        paystackReference: args.paystackReference,
      });
    }

    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: args.plan,
      status: "active",
      expiresAt: args.expiresAt,
      paystackReference: args.paystackReference,
    });
  },
});

// ==================== TIPS WITH PAYSTACK ====================

// Record a tip payment with Paystack reference
export const recordTipPayment = mutation({
  args: {
    creatorId: v.id("creators"),
    supporterName: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
    type: v.union(v.literal("tip"), v.literal("membership")),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    // Create the tip record
    const tipId = await ctx.db.insert("tips", {
      ...args,
      paystackReference: args.paystackReference,
    });

    // Update creator stats
    const creator = await ctx.db.get(args.creatorId);
    if (creator) {
      await ctx.db.patch(args.creatorId, {
        totalRevenue: creator.totalRevenue + args.amount,
        supporterCount: creator.supporterCount + 1,
      });
    }

    return { tipId, success: true };
  },
});

// ==================== WISHLIST CONTRIBUTIONS ====================

// Record a wishlist contribution with Paystack reference
export const recordWishlistContribution = mutation({
  args: {
    wishlistId: v.id("wishlists"),
    amount: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db.get(args.wishlistId);
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const newAmount = wishlist.currentAmount + args.amount;
    const newStatus = newAmount >= wishlist.targetAmount ? "completed" : wishlist.status;

    return await ctx.db.patch(args.wishlistId, {
      currentAmount: newAmount,
      status: newStatus,
    });
  },
});

// ==================== PRODUCT PURCHASES ====================

// Record a product purchase with Paystack reference
export const recordProductPurchase = mutation({
  args: {
    productId: v.id("products"),
    buyerEmail: v.string(),
    amount: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    // Create purchase record (you might want to create a purchases table)
    // For now, we'll just update the product stock if it's physical
    const product = await ctx.db.get(args.productId);
    
    if (product && product.type === "physical" && product.stock) {
      await ctx.db.patch(args.productId, {
        stock: product.stock - 1,
      });
    }

    // Update creator revenue
    const creator = await ctx.db.get(product!.creatorId);
    if (creator) {
      await ctx.db.patch(creator._id, {
        totalRevenue: creator.totalRevenue + args.amount,
      });
    }

    return { success: true };
  },
});

// ==================== HELPER FUNCTIONS ====================

// Generate unique reference for Paystack
export const generateReference = query({
  handler: async () => {
    return `DS_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  },
});

// Get user's payment history
export const getPaymentHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_creatorId")
      .filter((q) => q.eq(q.field("supporterName"), args.userId))
      .collect();

    return tips.map(tip => ({
      ...tip,
      type: "tip" as const,
    }));
  },
});
