import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return profile || { bankBalance: 0, cashBalance: 0, metroBalance: 0 };
  },
});

export const updateBalances = mutation({
  args: { 
    bankBalance: v.optional(v.number()),
    cashBalance: v.optional(v.number()),
    metroBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, args);
    } else {
      await ctx.db.insert("profiles", { userId, ...args });
    }
  },
});
