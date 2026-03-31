import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get showcase by creator ID
export const getShowcase = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const showcase = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .unique();

    if (!showcase) return null;

    return showcase;
  },
});

// Get showcase by username (for public view)
export const getShowcaseByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!creator) return null;

    const showcase = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creator._id))
      .unique();

    if (!showcase) return null;

    return { ...showcase, creator };
  },
});

// Create or update showcase
export const upsertShowcase = mutation({
  args: {
    creatorId: v.id("creators"),
    tokenIdentifier: v.optional(v.string()),
    role: v.optional(v.string()),
    location: v.optional(v.string()),
    about: v.optional(v.string()),
    hireLink: v.optional(v.string()),
    messageLink: v.optional(v.string()),
    skills: v.array(v.string()),
    featuredSlateIds: v.array(v.id("slates")),
    projects: v.array(v.object({
      id: v.string(),
      title: v.string(),
      story: v.string(),
      timeframe: v.optional(v.string()),
    })),
    sectionOrder: v.array(v.string()),
    hiddenSections: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { tokenIdentifier, creatorId, ...showcaseData } = args;

    // Verify ownership
    if (tokenIdentifier) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      const creator = await ctx.db.get(creatorId);
      if (!creator || creator.userId !== user._id) {
        throw new Error("You can only update your own showcase");
      }
    }

    // Check if showcase exists
    const existing = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creatorId))
      .unique();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, showcaseData);
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("showcases", {
        creatorId,
        ...showcaseData,
      });
    }
  },
});

// Delete showcase
export const deleteShowcase = mutation({
  args: {
    creatorId: v.id("creators"),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tokenIdentifier, creatorId } = args;

    // Verify ownership
    if (tokenIdentifier) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      const creator = await ctx.db.get(creatorId);
      if (!creator || creator.userId !== user._id) {
        throw new Error("You can only delete your own showcase");
      }
    }

    const showcase = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creatorId))
      .unique();

    if (showcase) {
      await ctx.db.delete(showcase._id);
    }

    return true;
  },
});

// Auto-generate showcase from user activity
export const generateShowcase = mutation({
  args: {
    creatorId: v.id("creators"),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tokenIdentifier, creatorId } = args;

    // Verify ownership
    if (tokenIdentifier) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .unique();

      if (!user) {
        throw new Error("User not found");
      }

      const creator = await ctx.db.get(creatorId);
      if (!creator || creator.userId !== user._id) {
        throw new Error("You can only generate showcase for your own profile");
      }
    }

    const creator = await ctx.db.get(creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get user's slates for featured work
    const slates = await ctx.db
      .query("slates")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creatorId))
      .collect();

    // Get top slates (by recency, could be enhanced with likes)
    const recentSlates = slates.slice(0, 6);
    const featuredSlateIds = recentSlates.map((s) => s._id);

    // Extract skills from slate titles/descriptions (simple keyword matching)
    const skillKeywords = [
      "UI", "UX", "Design", "Branding", "Logo", "Illustration",
      "Video", "Editing", "Animation", "Photography", "Writing",
      "Music", "Audio", "Podcast", "Art", "Digital Art", "3D",
      "Web", "App", "Development", "Coding", "Programming",
      "Marketing", "Social Media", "Content", "Strategy",
      "Consulting", "Coaching", "Teaching", "Training",
    ];

    const extractedSkills = new Set<string>();
    const allText = `${creator.bio || ""} ${creator.about || ""} ${slates.map((s) => `${s.title || ""} ${s.description || ""}`).join(" ")}`.toLowerCase();

    skillKeywords.forEach((keyword) => {
      if (allText.includes(keyword.toLowerCase())) {
        extractedSkills.add(keyword);
      }
    });

    // Add default skills if none extracted
    if (extractedSkills.size === 0) {
      extractedSkills.add("Content Creator");
    }

    // Create projects from series
    const series = await ctx.db
      .query("slateSeries")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creatorId))
      .collect();

    const projects = series.map((s) => ({
      id: s._id,
      title: s.title,
      story: s.description || `A series by ${creator.name}`,
      timeframe: undefined,
    }));

    // Check if showcase exists
    const existing = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", creatorId))
      .unique();

    const showcaseData = {
      creatorId,
      role: creator.bio?.split(" ")[0] || "Creator",
      location: undefined,
      about: creator.about || creator.bio || "",
      hireLink: undefined,
      messageLink: undefined,
      skills: Array.from(extractedSkills).slice(0, 10),
      featuredSlateIds,
      projects,
      sectionOrder: ["header", "featured", "skills", "projects", "proof", "shop", "about", "links"],
      hiddenSections: [] as string[],
    };

    if (existing) {
      await ctx.db.patch(existing._id, showcaseData);
      return existing._id;
    } else {
      return await ctx.db.insert("showcases", showcaseData);
    }
  },
});

// Update featured slates
export const updateFeaturedSlates = mutation({
  args: {
    showcaseId: v.id("showcases"),
    featuredSlateIds: v.array(v.id("slates")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.showcaseId, {
      featuredSlateIds: args.featuredSlateIds,
    });
    return args.showcaseId;
  },
});

// Update skills
export const updateSkills = mutation({
  args: {
    showcaseId: v.id("showcases"),
    skills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.showcaseId, {
      skills: args.skills,
    });
    return args.showcaseId;
  },
});

// Update section order
export const updateSectionOrder = mutation({
  args: {
    showcaseId: v.id("showcases"),
    sectionOrder: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.showcaseId, {
      sectionOrder: args.sectionOrder,
    });
    return args.showcaseId;
  },
});

// Toggle section visibility
export const toggleSectionVisibility = mutation({
  args: {
    showcaseId: v.id("showcases"),
    sectionId: v.string(),
    hidden: v.boolean(),
  },
  handler: async (ctx, args) => {
    const showcase = await ctx.db.get(args.showcaseId);
    if (!showcase) {
      throw new Error("Showcase not found");
    }

    const hiddenSections = args.hidden
      ? [...showcase.hiddenSections, args.sectionId]
      : showcase.hiddenSections.filter((id) => id !== args.sectionId);

    await ctx.db.patch(args.showcaseId, {
      hiddenSections,
    });

    return args.showcaseId;
  },
});

// Get showcase with featured slates data (for public view)
export const getShowcaseWithContent = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const showcase = await ctx.db
      .query("showcases")
      .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
      .unique();

    if (!showcase) return null;

    // Get featured slates with resolved media
    const featuredSlates = await Promise.all(
      showcase.featuredSlateIds.map(async (slateId) => {
        const slate = await ctx.db.get(slateId);
        if (!slate) return null;

        // Resolve media URLs
        let mediaUrl = slate.mediaUrl;
        let thumbnailImage = slate.thumbnailImage;

        if (mediaUrl && !mediaUrl.startsWith("http") && !mediaUrl.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(mediaUrl);
            if (url) mediaUrl = url;
          } catch (e) {
            // Keep original
          }
        }

        if (thumbnailImage && !thumbnailImage.startsWith("http") && !thumbnailImage.startsWith("data:")) {
          try {
            const url = await ctx.storage.getUrl(thumbnailImage);
            if (url) thumbnailImage = url;
          } catch (e) {
            // Keep original
          }
        }

        return { ...slate, mediaUrl, thumbnailImage };
      })
    );

    // Get creator info
    const creator = await ctx.db.get(args.creatorId);

    return {
      ...showcase,
      featuredSlates: featuredSlates.filter(Boolean),
      creator,
    };
  },
});
