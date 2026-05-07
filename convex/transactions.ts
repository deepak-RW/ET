import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getTransactions = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const addTransaction = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("transactions", {
      userId,
      description: args.description,
      amount: args.amount,
      type: args.type,
    });
  },
});

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (existing?.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const editTransaction = mutation({
  args: {
    id: v.id("transactions"),
    description: v.string(),
    amount: v.number(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (existing?.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      description: args.description,
      amount: args.amount,
      type: args.type,
      updatedAt: new Date().toISOString(),
    });
  },
});
