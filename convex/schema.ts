import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    uid: v.string(), // Firebase Auth UID
    username: v.string(),
    displayName: v.string(),
    bio: v.string(),
    photoURL: v.string(),
    isVerified: v.boolean(),
    socialLinks: v.object({
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    // Optional creator settings
    suggestedAmounts: v.optional(v.array(v.number())),
    supportMessage: v.optional(v.string()),
    goal: v.optional(v.object({
      title: v.string(),
      target: v.number(),
      current: v.number(),
      createdAt: v.number(),
    })),
    role: v.union(v.literal("user"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_uid", ["uid"])
    .index("by_username", ["username"]),

  kyc: defineTable({
    uid: v.string(), // Firebase Auth UID
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
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  }).index("by_uid", ["uid"]),

  tips: defineTable({
    creatorId: v.string(), // Firebase Auth UID
    supporterName: v.string(),
    amount: v.number(),
    message: v.string(),
    isAnonymous: v.boolean(),
    paymentReference: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_creatorId", ["creatorId"])
    .index("by_createdAt", ["createdAt"]),

  withdrawals: defineTable({
    creatorId: v.string(), // Firebase Auth UID
    amount: v.number(),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_creatorId", ["creatorId"])
    .index("by_createdAt", ["createdAt"]),

  bankDetails: defineTable({
    userId: v.string(), // Firebase Auth UID
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    bankCode: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});
