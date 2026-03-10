import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get bank details for a user
export const getBankDetails = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("bankDetails")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();
    },
});

// Save (upsert) bank details for a user
export const saveBankDetails = mutation({
    args: {
        userId: v.string(),
        bankName: v.string(),
        accountNumber: v.string(),
        accountName: v.string(),
        bankCode: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("bankDetails")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                bankName: args.bankName,
                accountNumber: args.accountNumber,
                accountName: args.accountName,
                bankCode: args.bankCode,
            });
        } else {
            await ctx.db.insert("bankDetails", args);
        }
    },
});
