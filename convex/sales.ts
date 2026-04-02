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

export const listSalesListings = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return [];

    let listings;
    if (args.status) {
      listings = await ctx.db
        .query("sales_listings")
        .withIndex("by_status", (q: any) => q.eq("status", args.status))
        .collect();
    } else {
      listings = await ctx.db.query("sales_listings").collect();
    }

    // Agents only see listings assigned to them
    if (role === "agent") {
      return listings.filter((l: any) =>
        l.assigned_agent_ids.includes(me.clerk_user_id)
      );
    }
    return listings;
  },
});

export const getSalesListing = query({
  args: { id: v.id("sales_listings") },
  handler: async (ctx, args) => {
    const { me, role } = await getCallerRole(ctx);
    if (!me) return null;
    const listing = await ctx.db.get(args.id);
    if (!listing) return null;
    if (
      role === "agent" &&
      !listing.assigned_agent_ids.includes(me.clerk_user_id)
    )
      return null;
    return listing;
  },
});

export const createSalesListing = mutation({
  args: {
    ref_no: v.string(),
    title_en: v.string(),
    title_ar: v.string(),
    type: v.string(),
    bedrooms: v.string(),
    price_aed: v.float64(),
    area_sqft: v.float64(),
    community: v.string(),
    area: v.string(),
    furnishing: v.string(),
    rera_permit: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("under_offer"),
      v.literal("reserved"),
      v.literal("sold"),
      v.literal("off_market"),
      v.literal("expired")
    ),
    amenities: v.array(v.string()),
    assigned_agent_ids: v.array(v.string()),
    photo_storage_ids: v.array(v.string()),
    description_en: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return await ctx.db.insert("sales_listings", args);
  },
});

export const updateSalesListing = mutation({
  args: {
    id: v.id("sales_listings"),
    title_en: v.optional(v.string()),
    title_ar: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.string()),
    price_aed: v.optional(v.float64()),
    area_sqft: v.optional(v.float64()),
    community: v.optional(v.string()),
    area: v.optional(v.string()),
    furnishing: v.optional(v.string()),
    rera_permit: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("under_offer"),
        v.literal("reserved"),
        v.literal("sold"),
        v.literal("off_market"),
        v.literal("expired")
      )
    ),
    amenities: v.optional(v.array(v.string())),
    assigned_agent_ids: v.optional(v.array(v.string())),
    description_en: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const { id, ...patch } = args;
    const filteredPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredPatch);
  },
});

export const assignAgentsToListing = mutation({
  args: {
    listing_id: v.id("sales_listings"),
    agent_ids: v.array(v.string()),
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
    await ctx.db.patch(args.listing_id, {
      assigned_agent_ids: args.agent_ids,
    });
  },
});
