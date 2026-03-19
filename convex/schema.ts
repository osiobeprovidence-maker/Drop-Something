import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    tokenIdentifier: v.string(), // For Firebase/Clerk/etc
  }).index("by_token", ["tokenIdentifier"]),

  creators: defineTable({
    userId: v.id("users"),
    username: v.string(),
    name: v.string(),
    bio: v.string(),
    avatar: v.string(),
    coverImage: v.string(),
    pageStyle: v.union(v.literal("support"), v.literal("shop"), v.literal("goal"), v.literal("hybrid")),
    totalRevenue: v.number(),
    supporterCount: v.number(),
  }).index("by_username", ["username"])
    .index("by_userId", ["userId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("creators"),
  }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),

  links: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    url: v.string(),
  }).index("by_creatorId", ["creatorId"]),

  memberships: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    price: v.number(),
    description: v.string(),
  }).index("by_creatorId", ["creatorId"]),

  goals: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
  }).index("by_creatorId", ["creatorId"]),

  products: defineTable({
    creatorId: v.id("creators"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    type: v.union(v.literal("digital"), v.literal("physical")),
    image: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    deliveryInfo: v.optional(v.string()),
  }).index("by_creatorId", ["creatorId"]),

  tips: defineTable({
    creatorId: v.id("creators"),
    supporterName: v.string(),
    amount: v.number(),
    message: v.optional(v.string()),
    type: v.union(v.literal("tip"), v.literal("membership")),
  }).index("by_creatorId", ["creatorId"]),
});
