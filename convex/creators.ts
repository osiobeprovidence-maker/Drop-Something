import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCreatorByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!creator) return null;

    const links = await ctx.db
      .query("links")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .collect();

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .collect();

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .collect();

    const products = await ctx.db
      .query("products")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .collect();

    const tips = await ctx.db
      .query("tips")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .collect();

    return {
      ...creator,
      links,
      memberships,
      goals,
      products,
      tips,
    };
  },
});

// Mutations
export const createCreator = mutation({
  args: {
    userId: v.id("users"),
    username: v.string(),
    name: v.string(),
    bio: v.string(),
    avatar: v.string(),
    coverImage: v.string(),
    pageStyle: v.union(v.literal("support"), v.literal("shop"), v.literal("goal"), v.literal("hybrid")),
  },
  handler: async (ctx, args) => {
    // Check if username already exists
    const existing = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    if (existing) {
      throw new Error("Username already taken");
    }

    return await ctx.db.insert("creators", {
      ...args,
      totalRevenue: 0,
      supporterCount: 0,
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const addTip = mutation({
  args: {
    creatorId: v.id("creators"),
    supporterName: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
    type: v.union(v.literal("tip"), v.literal("membership")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tips", args);
    const creator = await ctx.db.get(args.creatorId);
    if (creator) {
      await ctx.db.patch(args.creatorId, {
        totalRevenue: creator.totalRevenue + args.amount,
        supporterCount: creator.supporterCount + 1,
      });
    }
  },
});

export const listCreators = query({
  handler: async (ctx) => {
    return await ctx.db.query("creators").collect();
  },
});
