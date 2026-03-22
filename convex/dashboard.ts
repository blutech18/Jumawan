import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const certificates = await ctx.db.query("certificates").collect();
    const messages = await ctx.db.query("contact_messages").collect();
    const unread = messages.filter((m) => m.status === "unread");

    const recentMessages = messages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 3);

    const recentProjects = projects
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 3);

    return {
      totalProjects: projects.length,
      totalCertificates: certificates.length,
      totalMessages: messages.length,
      unreadMessages: unread.length,
      recentMessages,
      recentProjects,
    };
  },
});

// Auth: simple session-based authentication for admin
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // For security, admin credentials should be set as environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "cristanjade14@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (args.email !== adminEmail || !adminPassword || args.password !== adminPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // Generate a random session token
    const token = Array.from(
      { length: 64 },
      () => Math.random().toString(36).charAt(2)
    ).join("");

    // Session expires in 24 hours
    const expires_at = Date.now() + 24 * 60 * 60 * 1000;

    await ctx.db.insert("admin_sessions", {
      email: args.email,
      token,
      expires_at,
    });

    return { success: true, token, email: args.email };
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .collect();

    const session = sessions[0];
    if (!session || session.expires_at < Date.now()) {
      return { valid: false };
    }

    return { valid: true, email: session.email };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("admin_sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }
  },
});
