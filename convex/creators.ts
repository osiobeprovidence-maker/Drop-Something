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

    return await getCreatorDetails(ctx, creator);
  },
});

export const getCreatorByUserId = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    if (!creator) return null;

    return await getCreatorDetails(ctx, creator);
  },
});

async function getCreatorDetails(ctx: any, creator: any) {
  // Resolve avatar if it's a storageId
  let avatar = creator.avatar;
  if (avatar && !avatar.startsWith("http")) {
    try {
      const url = await ctx.storage.getUrl(avatar);
      if (url) avatar = url;
    } catch (e) {
      // Not a valid storageId, keep original
    }
  }

  // Resolve coverImage if it's a storageId
  let coverImage = creator.coverImage;
  if (coverImage && !coverImage.startsWith("http")) {
    try {
      const url = await ctx.storage.getUrl(coverImage);
      if (url) coverImage = url;
    } catch (e) {
      // Not a valid storageId, keep original
    }
  }

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
    avatar,
    coverImage,
    links,
    memberships,
    goals,
    products,
    tips,
  };
}

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
    const creators = await ctx.db.query("creators").collect();
    return await Promise.all(creators.map(async (creator) => {
      return await getCreatorDetails(ctx, creator);
    }));
  },
});

// Creator profile update mutation
export const updateCreator = mutation({
  args: {
    creatorId: v.id("creators"),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    pageStyle: v.optional(v.union(v.literal("support"), v.literal("shop"), v.literal("goal"), v.literal("hybrid"))),
  },
  handler: async (ctx, args) => {
    const { creatorId, ...updates } = args;
    
    // Check username uniqueness if updating username
    if (updates.username) {
      const existing = await ctx.db
        .query("creators")
        .withIndex("by_username", (q) => q.eq("username", updates.username!))
        .unique();
      
      if (existing && existing._id !== creatorId) {
        throw new Error("Username already taken");
      }
    }
    
    return await ctx.db.patch(creatorId, updates);
  },
});

// Links CRUD mutations
export const addLink = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("links", args);
  },
});

export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { linkId, ...updates } = args;
    return await ctx.db.patch(linkId, updates);
  },
});

export const deleteLink = mutation({
  args: { linkId: v.id("links") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.linkId);
  },
});

// Memberships CRUD mutations
export const createMembership = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    price: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memberships", args);
  },
});

export const updateMembership = mutation({
  args: {
    membershipId: v.id("memberships"),
    title: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membershipId, ...updates } = args;
    return await ctx.db.patch(membershipId, updates);
  },
});

export const deleteMembership = mutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.membershipId);
  },
});

// Goals CRUD mutations
export const createGoal = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    targetAmount: v.number(),
    currentAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("goals", {
      ...args,
      currentAmount: args.currentAmount ?? 0,
    });
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    currentAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { goalId, ...updates } = args;
    return await ctx.db.patch(goalId, updates);
  },
});

export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.goalId);
  },
});

// Products CRUD mutations
export const createProduct = mutation({
  args: {
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.union(v.literal("digital"), v.literal("physical")),
    image: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    deliveryInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if creator has active shop subscription
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    const hasSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", creator.userId))
      .unique();

    if (!hasSubscription || hasSubscription.status !== "active" || hasSubscription.plan !== "shop") {
      throw new Error("Shop requires active subscription (₦3000/month). Please subscribe to create products.");
    }

    return await ctx.db.insert("products", args);
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    type: v.optional(v.union(v.literal("digital"), v.literal("physical"))),
    image: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    deliveryInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    return await ctx.db.patch(productId, updates);
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.productId);
  },
});

// Follow mutations
export const followCreator = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("creators"),
  },
  handler: async (ctx, args) => {
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("follows", args);
  },
});

export const unfollowCreator = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("creators"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .first();
    
    if (follow) {
      await ctx.db.delete(follow._id);
    }
  },
});

// Query to check if user is following a creator
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("creators"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .filter((q) => q.eq(q.field("followingId"), args.followingId))
      .first();
    
    return !!follow;
  },
});

// Query to get follows for a user
export const getFollows = query({
  args: { followerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.followerId))
      .collect();
  },
});
