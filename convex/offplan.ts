import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getCallerRole(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return { me: null, role: null };
  const me = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q: any) =>
      q.eq("clerk_user_id", identity.subject)
    )
    .unique();
  return { me, role: me?.role ?? null };
}

export const listProjects = query({
  args: {},
  handler: async (ctx) => {
    const { me } = await getCallerRole(ctx);
    if (!me) return [];
    return await ctx.db.query("off_plan_projects").collect();
  },
});

export const getProject = query({
  args: { id: v.id("off_plan_projects") },
  handler: async (ctx, args) => {
    const { me } = await getCallerRole(ctx);
    if (!me) return null;
    return await ctx.db.get(args.id);
  },
});

export const createProject = mutation({
  args: {
    ref_no: v.string(),
    project_name: v.string(),
    developer_name: v.string(),
    community: v.string(),
    area: v.string(),
    handover_date: v.float64(),
    status: v.string(),
    commission_rate_pct: v.float64(),
    payment_plan_type: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");
    return await ctx.db.insert("off_plan_projects", args);
  },
});

export const listUnits = query({
  args: { project_id: v.id("off_plan_projects") },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return [];
    const units = await ctx.db
      .query("off_plan_units")
      .withIndex("by_project_id", (q: any) =>
        q.eq("project_id", args.project_id)
      )
      .collect();
    if (role === "agent") {
      return units.filter((u: any) => u.assigned_agent_id === me.clerk_user_id);
    }
    return units;
  },
});

export const createUnit = mutation({
  args: {
    project_id: v.id("off_plan_projects"),
    unit_number: v.string(),
    floor: v.float64(),
    unit_type: v.string(),
    bedrooms: v.string(),
    size_sqft: v.float64(),
    price_aed: v.float64(),
    status: v.union(
      v.literal("available"),
      v.literal("reserved"),
      v.literal("sold")
    ),
    assigned_agent_id: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");
    return await ctx.db.insert("off_plan_units", args);
  },
});

export const assignAgentToUnit = mutation({
  args: {
    unit_id: v.id("off_plan_units"),
    agent_clerk_id: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q: any) =>
        q.eq("clerk_user_id", identity.subject)
      )
      .unique();
    if (!me || me.role !== "ceo") throw new Error("Unauthorized");
    await ctx.db.patch(args.unit_id, { assigned_agent_id: args.agent_clerk_id });
  },
});

export const updateUnitStatus = mutation({
  args: {
    unit_id: v.id("off_plan_units"),
    status: v.union(
      v.literal("available"),
      v.literal("reserved"),
      v.literal("sold")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await ctx.db.patch(args.unit_id, { status: args.status });
  },
});
