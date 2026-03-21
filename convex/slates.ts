import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all slates for a creator (for dashboard)
export const getSlatesByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const slates = await ctx.db
      .query("slates")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .collect();

    // Resolve mediaUrl if it's a storageId
    const resolvedSlates = await Promise.all(
      slates.map(async (slate) => {
        let mediaUrl = slate.mediaUrl;
        if (mediaUrl && !mediaUrl.startsWith("http") && !mediaUrl.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(mediaUrl);
            if (url) mediaUrl = url;
          } catch (e) {
            // Not a valid storageId, keep original
          }
        }
        return { ...slate, mediaUrl };
      })
    );

    return resolvedSlates;
  },
});

// Get slates for a creator (for public page) - includes all slates with visibility info
export const getPublicSlatesByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const slates = await ctx.db
      .query("slates")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .collect();

    // Resolve mediaUrl if it's a storageId
    const resolvedSlates = await Promise.all(
      slates.map(async (slate) => {
        let mediaUrl = slate.mediaUrl;
        if (mediaUrl && !mediaUrl.startsWith("http") && !mediaUrl.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(mediaUrl);
            if (url) mediaUrl = url;
          } catch (e) {
            // Not a valid storageId, keep original
          }
        }
        return { ...slate, mediaUrl };
      })
    );

    return resolvedSlates;
  },
});

// Create a new slate
export const createSlate = mutation({
  args: {
    creatorId: v.id("creators"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("audio")),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members")),
  },
  handler: async (ctx, args) => {
    // Validation based on type
    if (args.type === "text" && !args.content) {
      throw new Error("Text slates require content");
    }

    if (args.type === "image" && !args.mediaUrl) {
      throw new Error("Image slates require mediaUrl");
    }

    if (args.type === "video" && !args.playbackId) {
      throw new Error("Video slates require playbackId");
    }

    if (args.type === "audio" && !args.playbackId && !args.mediaUrl) {
      throw new Error("Audio slates require playbackId or mediaUrl");
    }

    return await ctx.db.insert("slates", args);
  },
});

// Delete a slate
export const deleteSlate = mutation({
  args: { slateId: v.id("slates") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.slateId);
  },
});

// Update a slate
export const updateSlate = mutation({
  args: {
    slateId: v.id("slates"),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members"))),
  },
  handler: async (ctx, args) => {
    const { slateId, ...updates } = args;
    return await ctx.db.patch(slateId, updates);
  },
});

// Check if a user is following a creator
export const isFollowingCreator = query({
  args: { userId: v.id("users"), creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .filter((q) => q.eq(q.field("followingId"), args.creatorId))
      .first();
    return !!follow;
  },
});

// Check if user has supported a creator (tipped or membership)
export const hasSupportedCreator = query({
  args: { userId: v.id("users"), creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const tips = await ctx.db
      .query("tips")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .filter((q) => q.eq(q.field("supporterName"), args.userId))
      .collect();
    return tips.length > 0;
  },
});
