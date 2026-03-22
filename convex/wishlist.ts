import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all wishlists for a creator
export const getWishlistsByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlists")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Create a new wishlist item
export const createWishlist = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    targetAmount: v.number(),
    isRenewable: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wishlists", {
      ...args,
      currentAmount: 0,
      status: "active",
    });
  },
});

// Update a wishlist item
export const updateWishlist = mutation({
  args: {
    wishlistId: v.id("wishlists"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    isRenewable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { wishlistId, ...updates } = args;
    return await ctx.db.patch(wishlistId, updates);
  },
});

// Delete a wishlist item
export const deleteWishlist = mutation({
  args: { wishlistId: v.id("wishlists") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.wishlistId);
  },
});

// Contribute to a wishlist
export const contributeToWishlist = mutation({
  args: {
    wishlistId: v.id("wishlists"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db.get(args.wishlistId);
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const newAmount = wishlist.currentAmount + args.amount;
    const newStatus: "active" | "completed" = newAmount >= wishlist.targetAmount ? "completed" : wishlist.status;

    return await ctx.db.patch(args.wishlistId, {
      currentAmount: newAmount,
      status: newStatus,
    });
  },
});

// Reset a renewable wishlist
export const resetWishlist = mutation({
  args: { wishlistId: v.id("wishlists") },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db.get(args.wishlistId);
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    if (!wishlist.isRenewable) {
      throw new Error("This wishlist item is not renewable");
    }

    return await ctx.db.patch(args.wishlistId, {
      currentAmount: 0,
      status: "active",
    });
  },
});
