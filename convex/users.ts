import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the currently authenticated user's record
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
  },
});

// List all agents — CEO only
export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") return [];
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "agent"))
      .collect();
  },
});

// Upsert (invite/create) an agent — CEO only
export const inviteAgent = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    clerk_user_id: v.string(),
    agent_split_pct: v.float64(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", args.clerk_user_id)
      )
      .unique();
    if (existing) throw new Error("Agent already exists");

    return await ctx.db.insert("users", {
      clerk_user_id: args.clerk_user_id,
      name: args.name,
      email: args.email,
      phone: args.phone,
      role: "agent",
      agent_split_pct: args.agent_split_pct,
      is_active: true,
    });
  },
});

// Update an agent's split percentage — CEO only
export const updateAgentSplit = mutation({
  args: {
    agent_id: v.id("users"),
    agent_split_pct: v.float64(),
    is_active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");

    const patch: { agent_split_pct: number; is_active?: boolean } = {
      agent_split_pct: args.agent_split_pct,
    };
    if (args.is_active !== undefined) patch.is_active = args.is_active;
    await ctx.db.patch(args.agent_id, patch);
  },
});

// Ensure a user record exists for the current Clerk user (called on first login)
export const ensureUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerk_user_id: identity.subject,
      name: args.name,
      email: args.email,
      phone: args.phone ?? "",
      role: "agent",
      agent_split_pct: 50,
      is_active: true,
    });
  },
});

// Update own profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me) throw new Error("User not found");
    const patch: { name?: string; phone?: string } = {};
    if (args.name) patch.name = args.name;
    if (args.phone) patch.phone = args.phone;
    await ctx.db.patch(me._id, patch);
  },
});
