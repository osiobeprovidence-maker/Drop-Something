import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Submit KYC data
export const submitKYC = mutation({
    args: {
        uid: v.string(),
        fullName: v.string(),
        phoneNumber: v.string(),
        dateOfBirth: v.optional(v.string()),
        idType: v.union(
            v.literal("NIN"),
            v.literal("DriversLicense"),
            v.literal("Passport"),
            v.literal("VotersCard")
        ),
        idNumber: v.string(),
        idImageUrl: v.string(),
        selfieUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if a KYC record already exists for this user
        const existing = await ctx.db
            .query("kyc")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();

        if (existing) {
            // Update existing record
            await ctx.db.patch(existing._id, {
                ...args,
                status: "pending",
                submittedAt: Date.now(),
                reviewedAt: undefined,
                rejectionReason: undefined,
            });
            return existing._id;
        } else {
            return await ctx.db.insert("kyc", {
                ...args,
                status: "pending",
                submittedAt: Date.now(),
            });
        }
    },
});

// Get KYC record for the current user
export const getKYC = query({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("kyc")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
    },
});

// Get all KYC records (admin)
export const getAllKYC = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("kyc").order("desc").collect();
    },
});

// Approve or reject a KYC submission (admin)
export const updateKYCStatus = mutation({
    args: {
        uid: v.string(),
        status: v.union(v.literal("approved"), v.literal("rejected")),
        rejectionReason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const kyc = await ctx.db
            .query("kyc")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (!kyc) throw new Error("KYC record not found");

        await ctx.db.patch(kyc._id, {
            status: args.status,
            reviewedAt: Date.now(),
            rejectionReason: args.rejectionReason,
        });

        // If approved, mark user as verified
        if (args.status === "approved") {
            const user = await ctx.db
                .query("users")
                .withIndex("by_uid", (q) => q.eq("uid", args.uid))
                .unique();
            if (user) {
                await ctx.db.patch(user._id, { isVerified: true });
            }
        }
    },
});
