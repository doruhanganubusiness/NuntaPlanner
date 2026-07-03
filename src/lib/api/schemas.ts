import { z } from "zod";

/* -------------------------------- auth -------------------------------- */
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Parola trebuie să aibă minim 8 caractere"),
  full_name: z.string().min(1),
  user_type: z.enum(["client", "vendor"]).default("client"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/* ------------------------------ weddings ------------------------------ */
const weddingType = z.enum(["civil", "religious", "baptism"]);
const dateStatus = z.enum(["set", "estimated", "undecided"]);
const season = z.enum(["spring", "summer", "autumn", "winter"]);
const style = z.enum([
  "classic",
  "rustic",
  "boho",
  "modern",
  "glamour",
  "vintage",
  "garden",
  "traditional",
]);
const drinkMode = z.enum(["quantities", "cost"]);
const budgetCategory = z.enum([
  "venue_catering",
  "music",
  "photo_video",
  "decor_flowers",
  "attire",
  "drinks",
  "invitations_favors_cake",
  "misc",
]);

export const createWeddingSchema = z.object({
  name: z.string().min(1),
  region: z.string().min(1).optional(),
});

export const updateWeddingSchema = z
  .object({
    name: z.string().min(1),
    wedding_date: z.string().nullable(),
    date_status: dateStatus,
    estimated_season: season.nullable(),
    estimated_year: z.number().int().nullable(),
    wedding_type: z.array(weddingType),
    region: z.string().nullable(),
    county_code: z.string().nullable(),
    county: z.string().nullable(),
    locality: z.string().nullable(),
    style: style.nullable(),
    total_budget: z.number().nonnegative().nullable(),
    currency: z.string(),
    drink_mode: drinkMode,
    budget_priorities: z.array(budgetCategory).nullable(),
    music_choice: z.enum(["dj", "band", "band_and_dj"]).nullable(),
    invitation_couple: z.string().nullable(),
    invitation_message: z.string().nullable(),
    invitation_published: z.boolean(),
  })
  .partial();

/* ------------------------------- members ------------------------------ */
export const createMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["groom", "bride", "parent", "godparent", "viewer"]),
  permission: z.enum(["owner", "editor", "viewer"]).default("viewer"),
});

export const updateMemberSchema = z
  .object({
    role: z.enum(["groom", "bride", "parent", "godparent", "viewer"]),
    permission: z.enum(["owner", "editor", "viewer"]),
  })
  .partial();

export const acceptInviteSchema = z.object({
  invite_token: z.uuid(),
});

/* -------------------------------- slots ------------------------------- */
const slotType = z.enum([
  "civil_ceremony",
  "religious_ceremony",
  "baptism",
  "reception",
]);

export const createSlotSchema = z.object({
  slot_type: slotType,
  title: z.string().optional(),
  start_time: z.string().nullable().optional(),
  duration_minutes: z.number().int().nonnegative().nullable().optional(),
  location_name: z.string().nullable().optional(),
  location_address: z.string().nullable().optional(),
  guests_adults: z.number().int().nonnegative().optional(),
  guests_children: z.number().int().nonnegative().optional(),
  serves_alcohol: z.boolean().optional(),
  serves_full_meal: z.boolean().optional(),
  order_index: z.number().int().optional(),
});

export const updateSlotSchema = createSlotSchema.partial();
