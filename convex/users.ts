import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Get user by Firebase UID
export const getUserByUid = query({
    args: { uid: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
    },
});

// Get user by username
export const getUserByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
            .unique();
    },
});

// Get user by email
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();
    },
});

// Check if an email already exists
export const checkEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        try {
            const existing = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
                .first();
            return { exists: existing !== null };
        } catch (err: any) {
            console.error("checkEmail error:", err);
            throw new ConvexError(`checkEmail failed: ${err.message || String(err)}`);
        }
    },
});

// Check if a username is already taken
export const checkUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) =>
                q.eq("username", args.username.toLowerCase())
            )
            .unique();
        return { available: existing === null };
    },
});

// Create a new user profile
export const createUser = mutation({
    args: {
        uid: v.string(),
        email: v.string(),
        username: v.string(),
        displayName: v.string(),
        tagline: v.optional(v.string()),
        bio: v.string(),
        photoURL: v.string(),
        coverURL: v.optional(v.string()),
        membershipTiers: v.optional(v.array(v.object({
            title: v.string(),
            price: v.number(),
            benefits: v.array(v.string()),
        }))),
        products: v.optional(v.array(v.object({
            title: v.string(),
            price: v.number(),
            description: v.string(),
            imageUrl: v.string(),
        }))),
        socialLinks: v.optional(v.object({
            twitter: v.optional(v.string()),
            instagram: v.optional(v.string()),
            website: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        // Ensure username is not already taken
        const existing = await ctx.db
            .query("users")
            .withIndex("by_username", (q) =>
                q.eq("username", args.username.toLowerCase())
            )
            .unique();
        if (existing !== null) {
            throw new Error("Username already taken");
        }

        // Ensure email is not already registered
        const existingEmail = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
            .first();
        if (existingEmail !== null) {
            throw new Error("Email already registered");
        }

        return await ctx.db.insert("users", {
            uid: args.uid,
            email: args.email.toLowerCase(),
            username: args.username.toLowerCase(),
            displayName: args.displayName,
            tagline: args.tagline,
            bio: args.bio,
            photoURL: args.photoURL,
            coverURL: args.coverURL,
            membershipTiers: args.membershipTiers,
            products: args.products,
            socialLinks: args.socialLinks || {},
            isVerified: false,
            role: "user",
            createdAt: Date.now(),
        });
    },
});

// Update user profile fields
export const updateUser = mutation({
    args: {
        uid: v.string(),
        email: v.optional(v.string()),
        displayName: v.optional(v.string()),
        tagline: v.optional(v.string()),
        bio: v.optional(v.string()),
        photoURL: v.optional(v.string()),
        isVerified: v.optional(v.boolean()),
        socialLinks: v.optional(
            v.object({
                twitter: v.optional(v.string()),
                instagram: v.optional(v.string()),
                website: v.optional(v.string()),
            })
        ),
            suggestedAmounts: v.optional(v.array(v.number())),
            supportMessage: v.optional(v.string()),
            goal: v.optional(v.object({
                title: v.string(),
                target: v.number(),
                current: v.number(),
                createdAt: v.number(),
            })),
            coverURL: v.optional(v.string()),
            mediaIntros: v.optional(v.object({
                voiceUrl: v.optional(v.string()),
                videoUrl: v.optional(v.string()),
            })),
            membershipTiers: v.optional(v.array(v.object({
                title: v.string(),
                price: v.number(),
                benefits: v.array(v.string()),
            }))),
            products: v.optional(v.array(v.object({
                title: v.string(),
                price: v.number(),
                description: v.string(),
                imageUrl: v.string(),
            }))),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_uid", (q) => q.eq("uid", args.uid))
            .unique();
        if (!user) throw new Error("User not found");

        const { uid, ...updates } = args;
        // Remove undefined fields
        const patch: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(updates)) {
            if (v !== undefined) patch[k] = v;
        }
        await ctx.db.patch(user._id, patch);
    },
});

// Simple test query that returns a mock user object (no DB access).
export const getUserById = query({
    args: { userId: v.string() },
    handler: async (_ctx, args) => {
        // Return a mock user for testing frontend -> Convex connectivity.
        return {
            id: args.userId,
            name: "Test User",
            email: "test@example.com",
        };
    },
});
// List creators for explorer
export const listUsers = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .order("desc")
            .take(args.limit ?? 50);
    },
});
