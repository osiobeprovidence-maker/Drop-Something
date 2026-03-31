import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const GENERIC_CREATOR_NAMES = new Set(["anonymous", "unknown", "unnamed creator"]);

const resolveCreatorIdentity = (creator?: { name?: string; username?: string; avatar?: string | null } | null) => {
  const trimmedName = creator?.name?.trim();
  const normalizedName = trimmedName?.toLowerCase();
  const hasUsefulName = Boolean(trimmedName && normalizedName && !GENERIC_CREATOR_NAMES.has(normalizedName));
  const creatorUsername = creator?.username?.trim() || "anonymous";

  return {
    creatorName: hasUsefulName ? trimmedName! : creatorUsername,
    creatorUsername,
  };
};

const resolveSlateActor = async (
  ctx: any,
  tokenIdentifier?: string,
) => {
  const identity = await ctx.auth.getUserIdentity();
  const resolvedTokenIdentifier = identity?.subject || tokenIdentifier;

  if (!resolvedTokenIdentifier) {
    throw new Error("User not authenticated. Please log in.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("tokenIdentifier", resolvedTokenIdentifier))
    .unique();

  if (!user) {
    throw new Error("User profile not found. Please try logging out and back in.");
  }

  return user;
};

const userHasProSlateCaptions = async (ctx: any, userId: Id<"users">) => {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();

  return Boolean(
    subscription &&
    subscription.status === "active" &&
    subscription.expiresAt > Date.now() &&
    (subscription.plan === "premium" || subscription.plan === "shop")
  );
};

const resolveStorageUrl = async (ctx: any, value?: string | null) => {
  if (!value || value.startsWith("http") || value.startsWith("data:")) {
    return value || undefined;
  }

  try {
    const url = await ctx.storage.getUrl(value);
    return url || value;
  } catch {
    return value;
  }
};

const resolveSlateAssets = async (ctx: any, slate: any) => {
  const mediaUrl = await resolveStorageUrl(ctx, slate.mediaUrl);
  const thumbnailImage = await resolveStorageUrl(ctx, slate.thumbnailImage);
  return { ...slate, mediaUrl, thumbnailImage };
};

export const createSeries = mutation({
  args: {
    creatorId: v.id("creators"),
    tokenIdentifier: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await resolveSlateActor(ctx, args.tokenIdentifier);
    const creator = await ctx.db.get(args.creatorId);

    if (!creator || creator.userId !== user._id) {
      throw new Error("You can only create series for your own creator profile.");
    }

    return await ctx.db.insert("slateSeries", {
      creatorId: args.creatorId,
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      coverImage: args.coverImage,
    });
  },
});

export const getSeriesByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const series = await ctx.db
      .query("slateSeries")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    const withCounts = await Promise.all(
      series.map(async (item) => {
        const coverImage = await resolveStorageUrl(ctx, item.coverImage);
        const entries = await ctx.db
          .query("slates")
          .withIndex("by_seriesId", (q) => q.eq("seriesId", item._id))
          .collect();

        return {
          ...item,
          coverImage,
          entryCount: entries.length,
        };
      }),
    );

    return withCounts.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getPublicSeriesWithEntriesByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const series = await ctx.db
      .query("slateSeries")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    const structuredSeries = await Promise.all(
      series.map(async (item) => {
        const entries = await ctx.db
          .query("slates")
          .withIndex("by_seriesId", (q) => q.eq("seriesId", item._id))
          .collect();

        const orderedEntries = await Promise.all(
          entries
            .sort((a, b) => {
              const sequenceDelta = (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER);
              return sequenceDelta !== 0 ? sequenceDelta : a._creationTime - b._creationTime;
            })
            .map((entry) => resolveSlateAssets(ctx, entry)),
        );

        return {
          ...item,
          coverImage: await resolveStorageUrl(ctx, item.coverImage),
          entries: orderedEntries,
        };
      }),
    );

    return structuredSeries
      .filter((item) => item.entries.length > 0)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getPublicSeriesById = query({
  args: { seriesId: v.id("slateSeries") },
  handler: async (ctx, args) => {
    const series = await ctx.db.get(args.seriesId);
    if (!series) {
      return null;
    }

    const entries = await ctx.db
      .query("slates")
      .withIndex("by_seriesId", (q) => q.eq("seriesId", args.seriesId))
      .collect();

    const orderedEntries = await Promise.all(
      entries
        .sort((a, b) => {
          const sequenceDelta = (a.sequence ?? Number.MAX_SAFE_INTEGER) - (b.sequence ?? Number.MAX_SAFE_INTEGER);
          return sequenceDelta !== 0 ? sequenceDelta : a._creationTime - b._creationTime;
        })
        .map((entry) => resolveSlateAssets(ctx, entry)),
    );

    return {
      ...series,
      coverImage: await resolveStorageUrl(ctx, series.coverImage),
      entries: orderedEntries,
    };
  },
});

// Get all public slates for explore feed (paginated)
export const getPublicSlates = query({
  args: {
    cursor: v.optional(v.id("slates")),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Collect all public slates
    let allSlates = await ctx.db
      .query("slates")
      .withIndex("by_creatorId")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .collect();

    // Sort by creation time (newest first)
    allSlates.sort((a, b) => b._creationTime - a._creationTime);

    // Handle pagination
    const startIndex = args.cursor
      ? allSlates.findIndex(s => s._id === args.cursor) + 1
      : 0;

    const items = allSlates.slice(startIndex, startIndex + limit + 1);
    const hasMore = items.length > limit;
    const paginatedItems = items.slice(0, limit);

    // Resolve mediaUrl and add creator info
    const resolvedSlates = await Promise.all(
      paginatedItems.map(async (slate) => {
        const resolvedSlate = await resolveSlateAssets(ctx, slate);

        const creator = await ctx.db.get(slate.creatorId);
        let avatar = creator?.avatar;
        if (avatar && !avatar.startsWith("http") && !avatar.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(avatar);
            if (url) avatar = url;
          } catch (e) {
            // Not a valid storageId
          }
        }

        // Get like count
        const likeCount = (await ctx.db
          .query("slateLikes")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;

        // Get comment count
        const commentCount = (await ctx.db
          .query("slateComments")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;

        const { creatorName, creatorUsername } = resolveCreatorIdentity(creator);

        return {
          ...resolvedSlate,
          creatorName,
          creatorUsername,
          creatorAvatar: avatar,
          likeCount: likeCount || 0,
          commentCount: commentCount || 0,
        };
      })
    );

    return {
      items: resolvedSlates,
      hasMore,
      nextCursor: hasMore ? paginatedItems[paginatedItems.length - 1]._id : undefined,
    };
  },
});

// Get ALL slates for explore (including old posts, no pagination limit for small datasets)
export const getAllPublicSlates = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Collect all public slates
    let allSlates = await ctx.db
      .query("slates")
      .withIndex("by_creatorId")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .collect();

    // Sort by creation time (newest first)
    allSlates.sort((a, b) => b._creationTime - a._creationTime);

    // Resolve mediaUrl and add creator info
    const resolvedSlates = await Promise.all(
      allSlates.map(async (slate) => {
        const resolvedSlate = await resolveSlateAssets(ctx, slate);

        const creator = await ctx.db.get(slate.creatorId);
        let avatar = creator?.avatar;
        if (avatar && !avatar.startsWith("http") && !avatar.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(avatar);
            if (url) avatar = url;
          } catch (e) {
            // Not a valid storageId
          }
        }

        const { creatorName, creatorUsername } = resolveCreatorIdentity(creator);
        const likeCount = (await ctx.db
          .query("slateLikes")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;
        const commentCount = (await ctx.db
          .query("slateComments")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;
        const likedByViewer = args.userId
          ? !!(await ctx.db
              .query("slateLikes")
              .withIndex("by_userId_and_slateId", (q) =>
                q.eq("userId", args.userId!).eq("slateId", slate._id)
              )
              .first())
          : false;

        return {
          ...resolvedSlate,
          creatorName,
          creatorUsername,
          creatorAvatar: avatar,
          likeCount,
          commentCount,
          likedByViewer,
        };
      })
    );

    return resolvedSlates;
  },
});

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
        return await resolveSlateAssets(ctx, slate);
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

    const resolvedSlates = await Promise.all(
      slates
        .filter((slate) => !slate.seriesId)
        .map(async (slate) => resolveSlateAssets(ctx, slate))
    );

    return resolvedSlates;
  },
});

// Get slates from creators user follows
export const getFollowingSlates = query({
  args: { 
    userId: v.id("users"),
    cursor: v.optional(v.id("slates")),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get all creators user follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    if (follows.length === 0) {
      return { items: [], hasMore: false, nextCursor: undefined };
    }

    // Get slates from followed creators
    const allSlates: any[] = [];
    for (const follow of follows) {
      const creatorSlates = await ctx.db
        .query("slates")
        .withIndex("by_creatorId", (q) => q.eq("creatorId", follow.followingId))
        .filter((q) => q.eq(q.field("visibility"), "public"))
        .collect();
      allSlates.push(...creatorSlates);
    }

    // Sort by creation time (newest first)
    allSlates.sort((a, b) => b._creationTime - a._creationTime);

    const hasMore = allSlates.length > limit;
    const items = allSlates.slice(0, limit);

    // Resolve mediaUrl and add creator info
    const resolvedSlates = await Promise.all(
      items.map(async (slate) => {
        let mediaUrl = slate.mediaUrl;
        if (mediaUrl && !mediaUrl.startsWith("http") && !mediaUrl.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(mediaUrl);
            if (url) mediaUrl = url;
          } catch (e) {
            // Not a valid storageId
          }
        }

        const creator = await ctx.db.get(slate.creatorId);
        let avatar = (creator as any)?.avatar;
        const { creatorName, creatorUsername } = resolveCreatorIdentity(creator as any);
        
        if (avatar && !avatar.startsWith("http") && !avatar.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(avatar);
            if (url) avatar = url;
          } catch (e) {
            // Not a valid storageId
          }
        }

        const likeCount = (await ctx.db
          .query("slateLikes")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;

        const commentCount = (await ctx.db
          .query("slateComments")
          .withIndex("by_slateId", (q) => q.eq("slateId", slate._id))
          .collect()).length;
        const likedByViewer = !!(await ctx.db
          .query("slateLikes")
          .withIndex("by_userId_and_slateId", (q) =>
            q.eq("userId", args.userId).eq("slateId", slate._id)
          )
          .first());

        return {
          ...slate,
          mediaUrl,
          creatorName,
          creatorUsername,
          creatorAvatar: avatar,
          likeCount,
          commentCount,
          likedByViewer,
        };
      })
    );

    return {
      items: resolvedSlates,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : undefined,
    };
  },
});

// Create a new slate
export const createSlate = mutation({
  args: {
    creatorId: v.id("creators"),
    tokenIdentifier: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("audio")),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    thumbnailImage: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members")),
    seriesId: v.optional(v.id("slateSeries")),
    entryType: v.optional(v.union(v.literal("episode"), v.literal("chapter"))),
    sequence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await resolveSlateActor(ctx, args.tokenIdentifier);

      // ✅ STEP 2: Verify user owns the creator profile
      const creator = await ctx.db.get(args.creatorId);
      if (!creator) {
        console.error("❌ [createSlate] Creator not found:", args.creatorId);
        throw new Error("Creator profile not found.");
      }
      
      if (creator.userId !== user._id) {
        console.error(
          "❌ [createSlate] Unauthorized - User owns different creator profile. User ID:",
          user._id,
          "Creator's user ID:",
          creator.userId
        );
        throw new Error("You can only create slates for your own creator profile.");
      }
      // ✅ STEP 3: Validate content based on type
      if (args.type === "text" && !args.content) {
        console.error("❌ [createSlate] Text slate without content");
        throw new Error("Text slates require content");
      }

      if (args.seriesId) {
        const series = await ctx.db.get(args.seriesId);
        if (!series || series.creatorId !== args.creatorId) {
          throw new Error("Selected series was not found for this creator.");
        }

        if (!args.title?.trim()) {
          throw new Error("Series entries need a title.");
        }

        if (!args.entryType) {
          throw new Error("Series entries must be marked as an episode or chapter.");
        }

        if (!args.sequence || args.sequence < 1) {
          throw new Error("Series entries need a valid order number.");
        }
      }

      if (args.type === "image" && !args.mediaUrl) {
        console.error("❌ [createSlate] Image slate without mediaUrl");
        throw new Error("Image slates require mediaUrl");
      }

      if (args.type === "image" || args.type === "video" || args.type === "audio") {
        const caption = args.content?.trim();
        if (caption) {
          const hasProCaptions = await userHasProSlateCaptions(ctx, user._id);
          const captionLimit = hasProCaptions ? 700 : 300;

          if (caption.length > captionLimit) {
            throw new Error(`Captions are limited to ${captionLimit} characters on your current plan.`);
          }
        }
      }

      if (args.type === "video" && !args.playbackId && !args.mediaUrl) {
        console.error("❌ [createSlate] Video slate without playbackId or mediaUrl");
        throw new Error("Video slates require playbackId or mediaUrl");
      }

      if (args.type === "audio" && !args.playbackId && !args.mediaUrl) {
        console.error("❌ [createSlate] Audio slate without playbackId or mediaUrl");
        throw new Error("Audio slates require playbackId or mediaUrl");
      }

      // ✅ STEP 4: Create the slate
      const { tokenIdentifier, ...slateData } = args;
      const slateId = await ctx.db.insert("slates", slateData);
      console.log("✅ [createSlate] Slate created successfully:", slateId, "Type:", args.type);
      
      return slateId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ [createSlate] Error:", errorMessage);
      throw error;
    }
  },
});

// Delete a slate - with authentication and ownership check
export const deleteSlate = mutation({
  args: {
    slateId: v.id("slates"),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const user = await resolveSlateActor(ctx, args.tokenIdentifier);

      // ✅ STEP 2: Get the slate and verify ownership
      const slate = await ctx.db.get(args.slateId);
      if (!slate) {
        console.error("❌ [deleteSlate] Slate not found:", args.slateId);
        throw new Error("Slate not found.");
      }

      const creator = await ctx.db.get(slate.creatorId);
      if (!creator || creator.userId !== user._id) {
        console.error(
          "❌ [deleteSlate] Unauthorized - User does not own this slate"
        );
        throw new Error("You can only delete your own slates.");
      }

      // ✅ STEP 3: Delete the slate
      await ctx.db.delete(args.slateId);
      console.log("✅ [deleteSlate] Slate deleted successfully:", args.slateId);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ [deleteSlate] Error:", errorMessage);
      throw error;
    }
  },
});

// Update a slate - with authentication and ownership check
export const updateSlate = mutation({
  args: {
    slateId: v.id("slates"),
    tokenIdentifier: v.optional(v.string()),
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members"))),
  },
  handler: async (ctx, args) => {
    try {
      const user = await resolveSlateActor(ctx, args.tokenIdentifier);

      // ✅ STEP 2: Get the slate and verify ownership
      const slate = await ctx.db.get(args.slateId);
      if (!slate) {
        console.error("❌ [updateSlate] Slate not found:", args.slateId);
        throw new Error("Slate not found.");
      }

      const creator = await ctx.db.get(slate.creatorId);
      if (!creator || creator.userId !== user._id) {
        console.error(
          "❌ [updateSlate] Unauthorized - User does not own this slate"
        );
        throw new Error("You can only update your own slates.");
      }

      // ✅ STEP 3: Update the slate
      const { slateId, tokenIdentifier, ...updates } = args;
      await ctx.db.patch(args.slateId, updates);
      console.log("✅ [updateSlate] Slate updated successfully:", args.slateId);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ [updateSlate] Error:", errorMessage);
      throw error;
    }
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

// ==================== LIKES ====================

export const toggleLike = mutation({
  args: { slateId: v.id("slates"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("slateLikes")
      .withIndex("by_userId_and_slateId", (q) => q.eq("userId", args.userId).eq("slateId", args.slateId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    } else {
      await ctx.db.insert("slateLikes", {
        userId: args.userId,
        slateId: args.slateId,
      });
      return { liked: true };
    }
  },
});

export const isLiked = query({
  args: { slateId: v.id("slates"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("slateLikes")
      .withIndex("by_userId_and_slateId", (q) => q.eq("userId", args.userId).eq("slateId", args.slateId))
      .first();
    return !!like;
  },
});

// ==================== COMMENTS ====================

export const getComments = query({
  args: { slateId: v.id("slates") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("slateComments")
      .withIndex("by_slateId", (q) => q.eq("slateId", args.slateId))
      .collect();

    const resolvedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        const creatorProfile = await ctx.db
          .query("creators")
          .withIndex("by_userId", (q) => q.eq("userId", comment.userId))
          .unique();

        let userAvatar = creatorProfile?.avatar || user?.image;
        if (userAvatar && !userAvatar.startsWith("http") && !userAvatar.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(userAvatar);
            if (url) userAvatar = url;
          } catch (e) {
            // Not a valid storageId, keep original
          }
        }

        return {
          ...comment,
          userName: creatorProfile?.username || user?.name || "Anonymous",
          userAvatar,
        };
      })
    );

    return resolvedComments;
  },
});

export const addComment = mutation({
  args: {
    slateId: v.id("slates"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("slateComments", args);
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("slateComments") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.commentId);
  },
});

// Mux video upload actions (using Node runtime)
export { createVideoUpload, getVideoPlaybackInfo } from "./mux.node";
