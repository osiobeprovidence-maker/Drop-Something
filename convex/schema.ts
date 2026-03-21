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
    about: v.optional(v.string()),
    avatar: v.string(),
    coverImage: v.string(),
    coverPosition: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      zoom: v.number(),
    })),
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

  // Payment Details for creator payouts
  paymentDetails: defineTable({
    userId: v.id("users"),
    accountName: v.string(),
    bankName: v.string(),
    accountNumber: v.string(),
  }).index("by_userId", ["userId"]),

  // KYC verification
  kyc: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    idType: v.string(),
    idImageId: v.string(),
    selfieImageId: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Subscriptions for shop access
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(v.literal("shop"), v.literal("premium")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("cancelled")),
    expiresAt: v.number(), // Unix timestamp
    paystackReference: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // User delivery addresses
  addresses: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    isDefault: v.boolean(),
  }).index("by_userId", ["userId"]),

  // Slate content posts
  slates: defineTable({
    creatorId: v.id("creators"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video"), v.literal("audio")),
    content: v.optional(v.string()), // text content
    mediaUrl: v.optional(v.string()), // for images/audio (storageId or URL)
    playbackId: v.optional(v.string()), // for Mux video/audio playback
    visibility: v.union(v.literal("public"), v.literal("followers"), v.literal("supporters"), v.literal("members")),
  }).index("by_creatorId", ["creatorId"]),
});
