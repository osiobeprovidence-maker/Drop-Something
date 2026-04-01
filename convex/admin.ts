import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  findUserByUsername,
  requireAdmin,
  requireModerator,
  requireSuperAdmin,
  SUPER_ADMIN_USERNAME,
  withEffectiveRole,
} from "./auth";

async function updateRoleByUsername(
  ctx: MutationCtx,
  username: string,
  role: "admin" | "moderator" | "user",
) {
  const normalizedUsername = username.toLowerCase().trim();
  const user = await findUserByUsername(ctx, normalizedUsername);

  if (!user) {
    throw new Error(`User not found: ${normalizedUsername}`);
  }

  if (user.username?.toLowerCase() === SUPER_ADMIN_USERNAME) {
    return withEffectiveRole(user);
  }

  await ctx.db.patch(user._id, { role });
  const updatedUser = await ctx.db.get(user._id);
  if (!updatedUser) {
    throw new Error("Failed to update user role");
  }

  return withEffectiveRole(updatedUser);
}

export const getOverviewStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args;
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const slates = await ctx.db.query("slates").collect();
    const comments = await ctx.db.query("slateComments").collect();
    const creators = await ctx.db.query("creators").collect();
    const products = await ctx.db.query("products").collect();
    const reports = await ctx.db.query("reports").collect();

    const pendingReports = reports.filter((report) => report.status === "pending").length;

    return {
      totalUsers: users.length,
      totalSlates: slates.length,
      totalComments: comments.length,
      totalCreators: creators.length,
      totalProducts: products.length,
      pendingReports,
    };
  },
});

export const getAllUsers = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args;
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").collect();
    return users.map(withEffectiveRole);
  },
});

export const updateUserRole = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("moderator"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    if (args.role === "admin") {
      await requireSuperAdmin(ctx);
    } else {
      await requireAdmin(ctx);
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.username?.toLowerCase() === SUPER_ADMIN_USERNAME) {
      throw new Error("Cannot change the super admin role");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    const updatedUser = await ctx.db.get(args.userId);
    return updatedUser ? withEffectiveRole(updatedUser) : null;
  },
});

export const addAdmin = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    return await updateRoleByUsername(ctx, args.username, "admin");
  },
});

export const removeAdmin = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx);
    if (args.username.toLowerCase().trim() === SUPER_ADMIN_USERNAME) {
      throw new Error("Cannot remove the super admin");
    }
    return await updateRoleByUsername(ctx, args.username, "user");
  },
});

export const addModerator = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.username.toLowerCase().trim() === SUPER_ADMIN_USERNAME) {
      const user = await findUserByUsername(ctx, args.username);
      if (!user) {
        throw new Error(`User not found: ${args.username}`);
      }
      return withEffectiveRole(user);
    }
    return await updateRoleByUsername(ctx, args.username, "moderator");
  },
});

export const banUser = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    await requireModerator(ctx);
    return await ctx.db.patch(args.userId, {
      isBanned: true,
    });
  },
});

export const getAllSlates = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args;
    await requireAdmin(ctx);
    const slates = await ctx.db.query("slates").order("desc").collect();

    return await Promise.all(
      slates.map(async (slate) => {
        const creator = await ctx.db.get(slate.creatorId);
        return {
          ...slate,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );
  },
});

export const deleteSlate = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    slateId: v.id("slates"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    const admin = await requireAdmin(ctx);

    await ctx.db.insert("reports", {
      reporterId: admin._id,
      targetId: args.slateId,
      type: "slate",
      reason: args.reason || "Admin removed",
      status: "resolved",
    });

    return await ctx.db.delete(args.slateId);
  },
});

export const getAllComments = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args;
    await requireAdmin(ctx);
    const comments = await ctx.db.query("slateComments").order("desc").collect();

    return await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name || "Unknown",
        };
      })
    );
  },
});

export const deleteComment = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    commentId: v.id("slateComments"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args.reason;
    void args.sessionToken;
    await requireModerator(ctx);
    return await ctx.db.delete(args.commentId);
  },
});

export const getAllProducts = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args;
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();

    return await Promise.all(
      products.map(async (product) => {
        const creator = await ctx.db.get(product.creatorId);
        return {
          ...product,
          creatorName: creator?.name || "Unknown",
          creatorUsername: creator?.username || "unknown",
        };
      })
    );
  },
});

export const deleteProduct = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    await requireModerator(ctx);
    return await ctx.db.delete(args.productId);
  },
});

export const getReports = query({
  args: {
    sessionToken: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed"))),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    await requireModerator(ctx);

    if (args.status) {
      return await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .collect();
    }

    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const updateReportStatus = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    reportId: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("resolved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    await requireModerator(ctx);
    return await ctx.db.patch(args.reportId, { status: args.status });
  },
});

export const createReport = mutation({
  args: {
    reporterId: v.id("users"),
    targetId: v.union(v.id("slates"), v.id("slateComments")),
    type: v.union(v.literal("slate"), v.literal("comment")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      ...args,
      status: "pending",
    });
  },
});

export const updateUserPlan = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    void args.sessionToken;
    await requireAdmin(ctx);
    console.log(`Admin updated user ${args.userId} plan to ${args.plan}`);
    return { success: true };
  },
});
