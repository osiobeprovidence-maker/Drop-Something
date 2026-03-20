import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==================== PAYMENT DETAILS ====================

export const getPaymentDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentDetails")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const savePaymentDetails = mutation({
  args: {
    userId: v.id("users"),
    accountName: v.string(),
    bankName: v.string(),
    accountNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("paymentDetails")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        accountName: args.accountName,
        bankName: args.bankName,
        accountNumber: args.accountNumber,
      });
    }

    return await ctx.db.insert("paymentDetails", args);
  },
});

// ==================== KYC ====================

export const getKYC = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kyc")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const submitKYC = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    idType: v.string(),
    idImageId: v.string(),
    selfieImageId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("kyc")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      // Allow resubmission if rejected, otherwise throw
      if (existing.status === "approved") {
        throw new Error("KYC already approved. Contact support for changes.");
      }
      return await ctx.db.patch(existing._id, {
        ...args,
        status: "pending" as const,
        rejectionReason: undefined,
      });
    }

    return await ctx.db.insert("kyc", {
      ...args,
      status: "pending" as const,
    });
  },
});

// Admin function to approve/reject KYC (for future use)
export const updateKYCStatus = mutation({
  args: {
    kycId: v.id("kyc"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.kycId, {
      status: args.status,
      rejectionReason: args.rejectionReason,
    });
  },
});

// ==================== SUBSCRIPTIONS ====================

export const getSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const hasActiveSubscription = query({
  args: { userId: v.id("users"), plan: v.union(v.literal("shop"), v.literal("premium")) },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!subscription) return false;
    if (subscription.status !== "active") return false;
    if (subscription.plan !== args.plan) return false;
    if (subscription.expiresAt < Date.now()) return false;

    return true;
  },
});

export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("shop"), v.literal("premium")),
    expiresAt: v.number(),
    paystackReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: "active" as const,
        expiresAt: args.expiresAt,
        paystackReference: args.paystackReference,
      });
    }

    return await ctx.db.insert("subscriptions", {
      ...args,
      status: "active" as const,
    });
  },
});

export const cancelSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (subscription) {
      return await ctx.db.patch(subscription._id, {
        status: "cancelled" as const,
      });
    }
  },
});

// ==================== ADDRESSES ====================

export const getAddresses = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("addresses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getDefaultAddress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    return addresses.find(a => a.isDefault) || addresses[0] || null;
  },
});

export const addAddress = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this is default, unset other defaults
    if (args.isDefault) {
      const existing = await ctx.db
        .query("addresses")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      
      for (const addr of existing) {
        if (addr.isDefault) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    return await ctx.db.insert("addresses", args);
  },
});

export const updateAddress = mutation({
  args: {
    addressId: v.id("addresses"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { addressId, ...updates } = args;
    
    // If setting as default, unset other defaults
    if (updates.isDefault) {
      const address = await ctx.db.get(addressId);
      if (address) {
        const existing = await ctx.db
          .query("addresses")
          .withIndex("by_userId", (q) => q.eq("userId", address.userId))
          .collect();
        
        for (const addr of existing) {
          if (addr._id !== addressId && addr.isDefault) {
            await ctx.db.patch(addr._id, { isDefault: false });
          }
        }
      }
    }

    return await ctx.db.patch(addressId, updates);
  },
});

export const deleteAddress = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.addressId);
  },
});

// ==================== HELPER ====================

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
