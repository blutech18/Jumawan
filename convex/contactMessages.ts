import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { statusFilter: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.statusFilter && args.statusFilter !== "all") {
      const all = await ctx.db
        .query("contact_messages")
        .withIndex("by_status")
        .collect();
      return all.filter((m) => m.status === args.statusFilter);
    }
    return await ctx.db.query("contact_messages").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("unread"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contact_messages", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("contact_messages"),
    status: v.union(
      v.literal("unread"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("contact_messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
