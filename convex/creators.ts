import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

// Get all creators for Explore page
export const listCreators = query({
  handler: async (ctx) => {
    const creators = await ctx.db.query("creators").collect();
    return await Promise.all(creators.map(async (creator) => {
      return await getCreatorDetails(ctx, creator);
    }));
  },
});

// Get creators that a user is following
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();
    
    const creatorIds = follows.map(f => f.followingId);
    const creators = await Promise.all(
      creatorIds.map(id => ctx.db.get(id))
    );
    
    return creators.filter(Boolean);
  },
});

// Check if user follows a creator
export const isFollowing = query({
  args: { userId: v.id("users"), creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("followingId"), args.creatorId))
      .unique();
    
    return !!follow;
  },
});

// Follow a creator
export const follow = mutation({
  args: { userId: v.id("users"), creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("followingId"), args.creatorId))
      .unique();
    
    if (existing) return;
    
    await ctx.db.insert("follows", {
      followerId: args.userId,
      followingId: args.creatorId,
    });
    
    // Update supporter count
    const creator = await ctx.db.get(args.creatorId);
    if (creator) {
      await ctx.db.patch(creator._id, {
        supporterCount: creator.supporterCount + 1,
      });
    }
  },
});

// Unfollow a creator
export const unfollow = mutation({
  args: { userId: v.id("users"), creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("followingId"), args.creatorId))
      .unique();
    
    if (!follow) return;
    
    await ctx.db.delete(follow._id);
    
    // Update supporter count
    const creator = await ctx.db.get(args.creatorId);
    if (creator) {
      await ctx.db.patch(creator._id, {
        supporterCount: Math.max(0, creator.supporterCount - 1),
      });
    }
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
