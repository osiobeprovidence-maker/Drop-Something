import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get withdrawals for a specific creator
export const getWithdrawalsByCreator = query({
    args: { creatorId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("withdrawals")
            .withIndex("by_creatorId", (q) => q.eq("creatorId", args.creatorId))
            .order("desc")
            .collect();
    },
});

// Get all withdrawals (admin)
export const getAllWithdrawals = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("withdrawals")
            .withIndex("by_createdAt")
            .order("desc")
            .collect();
    },
});

// Request a withdrawal
export const createWithdrawal = mutation({
    args: {
        creatorId: v.string(),
        amount: v.number(),
        bankName: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("withdrawals", {
            ...args,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

// Update withdrawal status (admin)
export const updateWithdrawalStatus = mutation({
    args: {
        id: v.id("withdrawals"),
        status: v.union(v.literal("completed"), v.literal("rejected")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            processedAt: Date.now(),
        });
    },
});
