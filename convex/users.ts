import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  ensureUserFromIdentity,
  findUserByEmail,
  findUserByUsername,
  getCurrentUserOrNull,
  requireSuperAdmin,
} from "./auth";

export const storeUser = mutation({
  args: {
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const result = await ensureUserFromIdentity(ctx, args);
    return { id: result.user._id, isNew: result.isNew };
  },
});

export const currentUser = query({
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

// Mutation to set admin role for a username. Restricted to the super admin.
export const setAdminRole = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const user = await findUserByUsername(ctx, args.username);

    if (!user) {
      throw new Error(`User not found: No user exists with username ${args.username}`);
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, userId: user._id, username: user.username };
  },
});

// Also export a simpler version for the mutation helper
export const setAdminRoleMutation = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    const user = await findUserByUsername(ctx, args.username);

    if (!user) {
      throw new Error(`User not found: No user exists with username ${args.username}`);
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, userId: user._id, username: user.username };
  },
});

// Get user by email (for admin purposes)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await findUserByEmail(ctx, args.email);
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await findUserByUsername(ctx, args.username);
  },
});
