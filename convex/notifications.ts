import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listNotifications = query({
  args: { unread_only: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (args.unread_only) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_unread", (q) =>
          q.eq("user_id", identity.subject).eq("is_read", false)
        )
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("user_id", identity.subject))
      .order("desc")
      .take(50);
  },
});

export const markAsRead = mutation({
  args: { notification_id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await ctx.db.patch(args.notification_id, { is_read: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("user_id", identity.subject).eq("is_read", false)
      )
      .collect();
    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { is_read: true }))
    );
  },
});
