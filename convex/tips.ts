import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get tips for a specific creator
export const getTipsByCreator = query({
    args: { creatorId: v.string() },
    handler: async (ctx, args) => {
        const tips = await ctx.db
            .query("tips")
            .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
            .order("desc")
            .collect();
        
        return Promise.all(tips.map(async (tip) => ({
            ...tip,
            voiceUrl: tip.voiceUrl ? await ctx.storage.getUrl(tip.voiceUrl) : undefined,
        })));
    },
});

// Get all tips (admin only)
export const getAllTips = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("tips").withIndex("by_createdAt").order("desc").collect();
    },
});

// Create a tip (called from payment webhook / server action)
export const createTip = mutation({
    args: {
        creatorId: v.string(),
        supporterName: v.string(),
        amount: v.number(),
        message: v.string(),
        isAnonymous: v.boolean(),
        paymentReference: v.string(),
        voiceUrl: v.optional(v.string()),
        status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tips", {
            ...args,
            createdAt: Date.now(),
        });
    },
});
