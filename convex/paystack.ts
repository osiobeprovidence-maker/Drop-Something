import { action, mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_PAYMENT_TYPE = v.union(
  v.literal("tip"),
  v.literal("membership"),
  v.literal("product"),
  v.literal("goal"),
  v.literal("wishlist"),
  v.literal("subscription"),
);
const SUBSCRIPTION_PLAN = v.union(v.literal("shop"), v.literal("premium"));

async function applySubscription(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    plan: "shop" | "premium";
    expiresAt: number;
    paystackReference: string;
  },
) {
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      plan: args.plan,
      status: "active",
      expiresAt: args.expiresAt,
      paystackReference: args.paystackReference,
    });

    return existing._id;
  }

  return await ctx.db.insert("subscriptions", {
    userId: args.userId,
    plan: args.plan,
    status: "active",
    expiresAt: args.expiresAt,
    paystackReference: args.paystackReference,
  });
}

async function applyTipPayment(
  ctx: MutationCtx,
  args: {
    creatorId: Id<"creators">;
    supporterName: string;
    amount: number;
    message?: string;
    type: "tip" | "membership";
    paystackReference: string;
  },
) {
  const tipId = await ctx.db.insert("tips", {
    creatorId: args.creatorId,
    supporterName: args.supporterName,
    amount: args.amount,
    message: args.message,
    type: args.type,
    paystackReference: args.paystackReference,
  });

  const creator = await ctx.db.get(args.creatorId);
  if (creator) {
    await ctx.db.patch(creator._id, {
      totalRevenue: creator.totalRevenue + args.amount,
      supporterCount: creator.supporterCount + 1,
    });
  }

  return { tipId, success: true };
}

async function applyWishlistContribution(
  ctx: MutationCtx,
  args: {
    wishlistId: Id<"wishlists">;
    amount: number;
  },
) {
  const wishlist = await ctx.db.get(args.wishlistId);
  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  const newAmount = wishlist.currentAmount + args.amount;
  const newStatus = newAmount >= wishlist.targetAmount ? "completed" : wishlist.status;

  await ctx.db.patch(wishlist._id, {
    currentAmount: newAmount,
    status: newStatus,
  });

  return { success: true };
}

async function applyGoalContribution(
  ctx: MutationCtx,
  args: {
    goalId: Id<"goals">;
    amount: number;
  },
) {
  const goal = await ctx.db.get(args.goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  const nextAmount = Math.min(goal.targetAmount, goal.currentAmount + args.amount);

  await ctx.db.patch(goal._id, {
    currentAmount: nextAmount,
  });

  return { success: true };
}

async function applyProductPurchase(
  ctx: MutationCtx,
  args: {
    productId: Id<"products">;
    amount: number;
  },
) {
  const product = await ctx.db.get(args.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const deliveryRequired = product.type === "physical";

  if (deliveryRequired && product.stock) {
    await ctx.db.patch(product._id, {
      stock: Math.max(0, product.stock - 1),
    });
  }

  const creator = await ctx.db.get(product.creatorId);
  if (creator) {
    await ctx.db.patch(creator._id, {
      totalRevenue: creator.totalRevenue + args.amount,
    });
  }

  return { success: true, deliveryRequired };
}

export const initializePayment = action({
  args: {
    email: v.string(),
    amount: v.number(),
    reference: v.string(),
    callbackUrl: v.string(),
    metadata: v.object({
      type: PAYSTACK_PAYMENT_TYPE,
      creatorId: v.optional(v.string()),
      userId: v.string(),
      itemId: v.optional(v.string()),
      subscriptionPlan: v.optional(SUBSCRIPTION_PLAN),
    }),
  },
  handler: async (_ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: args.email,
          amount: args.amount * 100,
          reference: args.reference,
          metadata: args.metadata,
          callback_url: args.callbackUrl,
        }),
      });

      const data = await response.json();

      if (!data.status) {
        const message = data?.message || "Failed to initialize payment";
        console.error("Paystack initialize response error:", data);
        throw new Error(message);
      }

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      };
    } catch (error) {
      console.error("Paystack initialization error:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to initialize payment");
    }
  },
});

export const verifyPayment = action({
  args: {
    reference: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("Paystack secret key not configured");
    }

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${args.reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
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

export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: SUBSCRIPTION_PLAN,
    expiresAt: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await applySubscription(ctx, args);
  },
});

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
    return await applyTipPayment(ctx, args);
  },
});

export const recordWishlistContribution = mutation({
  args: {
    wishlistId: v.id("wishlists"),
    amount: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await applyWishlistContribution(ctx, args);
  },
});

export const recordProductPurchase = mutation({
  args: {
    productId: v.id("products"),
    buyerEmail: v.string(),
    amount: v.number(),
    paystackReference: v.string(),
  },
  handler: async (ctx, args) => {
    return await applyProductPurchase(ctx, args);
  },
});

export const fulfillPayment = mutation({
  args: {
    reference: v.string(),
    type: PAYSTACK_PAYMENT_TYPE,
    amount: v.number(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    creatorId: v.optional(v.id("creators")),
    itemId: v.optional(v.string()),
    subscriptionPlan: v.optional(SUBSCRIPTION_PLAN),
    supporterName: v.optional(v.string()),
    message: v.optional(v.string()),
    buyerPhone: v.optional(v.string()),
    quantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingReceipt = await ctx.db
      .query("paymentReceipts")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (existingReceipt) {
      return {
        success: true,
        alreadyProcessed: true,
        deliveryRequired: existingReceipt.deliveryRequired,
      };
    }

    const fallbackSupporterName =
      args.supporterName?.trim() ||
      args.email.split("@")[0] ||
      "Anonymous Supporter";
    let deliveryRequired = false;

    switch (args.type) {
      case "tip":
        if (!args.creatorId) {
          throw new Error("Creator is required for tips");
        }
        await applyTipPayment(ctx, {
          creatorId: args.creatorId,
          supporterName: fallbackSupporterName,
          amount: args.amount,
          message: args.message?.trim() || undefined,
          type: "tip",
          paystackReference: args.reference,
        });
        break;
      case "membership":
        if (!args.creatorId) {
          throw new Error("Creator is required for memberships");
        }
        await applyTipPayment(ctx, {
          creatorId: args.creatorId,
          supporterName: fallbackSupporterName,
          amount: args.amount,
          message: args.message?.trim() || undefined,
          type: "membership",
          paystackReference: args.reference,
        });
        break;
      case "wishlist":
        if (!args.itemId) {
          throw new Error("Wishlist item is required");
        }
        await applyWishlistContribution(ctx, {
          wishlistId: args.itemId as Id<"wishlists">,
          amount: args.amount,
        });
        break;
      case "goal":
        if (!args.itemId) {
          throw new Error("Goal is required");
        }
        await applyGoalContribution(ctx, {
          goalId: args.itemId as Id<"goals">,
          amount: args.amount,
        });
        break;
      case "product":
        if (!args.itemId) {
          throw new Error("Product is required");
        }
        {
          const purchase = await applyProductPurchase(ctx, {
          productId: args.itemId as Id<"products">,
          amount: args.amount,
        });
          deliveryRequired = purchase.deliveryRequired;
        }
        break;
      case "subscription":
        if (!args.userId) {
          throw new Error("User is required for subscriptions");
        }
        await applySubscription(ctx, {
          userId: args.userId,
          plan: args.subscriptionPlan || "shop",
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          paystackReference: args.reference,
        });
        break;
    }

    await ctx.db.insert("paymentReceipts", {
      reference: args.reference,
      type: args.type,
      amount: args.amount,
      email: args.email,
      userId: args.userId,
      creatorId: args.creatorId,
      itemId: args.itemId,
      subscriptionPlan: args.subscriptionPlan,
      supporterName: args.supporterName?.trim() || undefined,
      message: args.message?.trim() || undefined,
      buyerPhone: args.buyerPhone?.trim() || undefined,
      quantity: args.quantity,
      deliveryRequired,
      fulfilledAt: Date.now(),
    });

    return { success: true, alreadyProcessed: false, deliveryRequired };
  },
});

export const generateReference = query({
  handler: async () => {
    return `DS_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  },
});

export const getPaymentHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_creatorId")
      .filter((q) => q.eq(q.field("supporterName"), args.userId))
      .collect();

    return tips.map((tip) => ({
      ...tip,
      type: "tip" as const,
    }));
  },
});

export const getPurchasedProductDownload = query({
  args: {
    reference: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db
      .query("paymentReceipts")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .unique();

    if (!receipt || receipt.type !== "product") {
      return null;
    }

    if (receipt.email.toLowerCase() !== args.email.trim().toLowerCase()) {
      return null;
    }

    if (!receipt.itemId) {
      return null;
    }

    const product = await ctx.db.get(receipt.itemId as Id<"products">);
    if (!product || product.type !== "digital" || !product.fileUrl) {
      return null;
    }

    let downloadUrl = product.fileUrl;
    if (!downloadUrl.startsWith("http")) {
      const resolvedUrl = await ctx.storage.getUrl(downloadUrl);
      if (!resolvedUrl) {
        return null;
      }
      downloadUrl = resolvedUrl;
    }

    return {
      downloadUrl,
      title: product.title,
    };
  },
});
