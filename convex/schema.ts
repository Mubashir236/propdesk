import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  company_settings: defineTable({
    commission_rate_sales: v.float64(),
    commission_rate_rental: v.float64(),
    default_agent_split: v.float64(),
    target_monthly_revenue: v.float64(),
  }),

  users: defineTable({
    clerk_user_id: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("ceo"), v.literal("agent")),
    agent_split_pct: v.float64(),
    is_active: v.boolean(),
  }).index("by_clerk_user_id", ["clerk_user_id"]),

  sales_listings: defineTable({
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
  })
    .index("by_status", ["status"])
    .index("by_ref_no", ["ref_no"]),

  rental_listings: defineTable({
    ref_no: v.string(),
    title_en: v.string(),
    type: v.string(),
    bedrooms: v.string(),
    annual_rent_aed: v.float64(),
    area_sqft: v.float64(),
    community: v.string(),
    area: v.string(),
    available_from: v.float64(),
    payment_freq: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("viewing_arranged"),
      v.literal("rented"),
      v.literal("renewal_pending"),
      v.literal("vacant")
    ),
    assigned_agent_ids: v.array(v.string()),
    photo_storage_ids: v.array(v.string()),
    ejari_number: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_ref_no", ["ref_no"]),

  off_plan_projects: defineTable({
    ref_no: v.string(),
    project_name: v.string(),
    developer_name: v.string(),
    community: v.string(),
    area: v.string(),
    handover_date: v.float64(),
    status: v.string(),
    commission_rate_pct: v.float64(),
    payment_plan_type: v.string(),
  }).index("by_ref_no", ["ref_no"]),

  off_plan_units: defineTable({
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
  })
    .index("by_project_id", ["project_id"])
    .index("by_status", ["status"]),

  leads: defineTable({
    ref_no: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    nationality: v.string(),
    lead_type: v.union(
      v.literal("buyer"),
      v.literal("tenant"),
      v.literal("investor")
    ),
    source: v.string(),
    budget_min: v.float64(),
    budget_max: v.float64(),
    property_type_pref: v.string(),
    area_pref: v.string(),
    timeline: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("viewing_scheduled"),
      v.literal("offer_made"),
      v.literal("negotiating"),
      v.literal("closed"),
      v.literal("lost")
    ),
    assigned_agent_id: v.string(),
    notes: v.string(),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["assigned_agent_id"])
    .index("by_ref_no", ["ref_no"]),

  activities: defineTable({
    lead_id: v.id("leads"),
    agent_id: v.string(),
    type: v.union(
      v.literal("call"),
      v.literal("whatsapp"),
      v.literal("email"),
      v.literal("viewing"),
      v.literal("note"),
      v.literal("stage_change")
    ),
    notes: v.string(),
    created_at: v.float64(),
  }).index("by_lead_id", ["lead_id"]),

  deals: defineTable({
    ref_no: v.string(),
    lead_id: v.id("leads"),
    deal_type: v.union(
      v.literal("sale"),
      v.literal("rental"),
      v.literal("off_plan")
    ),
    property_id: v.string(),
    agent_id: v.string(),
    final_price_aed: v.float64(),
    status: v.union(
      v.literal("in_progress"),
      v.literal("closed"),
      v.literal("lost")
    ),
    closed_at: v.float64(),
  })
    .index("by_agent_id", ["agent_id"])
    .index("by_status", ["status"]),

  commissions: defineTable({
    deal_id: v.id("deals"),
    agent_id: v.string(),
    total_aed: v.float64(),
    agent_share_aed: v.float64(),
    company_share_aed: v.float64(),
    rate_pct: v.float64(),
    split_pct: v.float64(),
    calculated_at: v.float64(),
  })
    .index("by_deal_id", ["deal_id"])
    .index("by_agent_id", ["agent_id"]),

  notifications: defineTable({
    user_id: v.string(),
    type: v.string(),
    message: v.string(),
    related_id: v.string(),
    is_read: v.boolean(),
    created_at: v.float64(),
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_unread", ["user_id", "is_read"]),
});
