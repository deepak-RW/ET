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
    updatedAt: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
  profiles: defineTable({
    userId: v.id("users"),
    starting_balance: v.number(),
  }).index("by_userId", ["userId"]),
});
