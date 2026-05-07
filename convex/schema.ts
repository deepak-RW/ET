import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  transactions: defineTable({
    userId: v.id("users"),
    description: v.string(),
    amount: v.number(),
    type: v.string(),
    source: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  profiles: defineTable({
    userId: v.id("users"),
    starting_balance: v.optional(v.number()),
    bankBalance: v.optional(v.number()),
    cashBalance: v.optional(v.number()),
    metroBalance: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
});
