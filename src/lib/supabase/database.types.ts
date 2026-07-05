/**
 * Tipuri pentru schema Faza 1. Scrise manual (oglindesc migrațiile din
 * supabase/migrations). După aplicarea migrațiilor pe DB, pot fi regenerate cu:
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserType = "client" | "vendor";
export type DateStatus = "set" | "estimated" | "undecided";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type WeddingStyle =
  | "classic"
  | "rustic"
  | "boho"
  | "modern"
  | "glamour"
  | "vintage"
  | "garden"
  | "traditional";
export type DrinkModeDb = "quantities" | "cost";
export type MusicChoiceDb = "dj" | "band" | "band_and_dj";
export type MemberRole = "groom" | "bride" | "parent" | "godparent" | "viewer";
export type MemberPermission = "owner" | "editor" | "viewer";
export type MemberStatus = "pending" | "active";
export type SlotTypeDb =
  | "civil_ceremony"
  | "religious_ceremony"
  | "baptism"
  | "reception";

// ---- Faza 2: marketplace furnizori ----
export type VendorTierDb = "budget" | "mid" | "premium";
export type VendorStatus = "pending" | "active" | "suspended" | "inactive";
export type LeadStatus =
  | "new"
  | "unlocked"
  | "contacted"
  | "converted"
  | "lost";
export type PaymentType = "cpl_lead" | "subscription_monthly";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type SubscriptionStatus = "active" | "cancelled" | "paused";
export type ReviewRole = "vendor" | "couple";
export type VendorMediaType = "image" | "video";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: UserType;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type WeddingRow = {
  id: string;
  name: string;
  wedding_date: string | null;
  date_status: DateStatus;
  estimated_season: Season | null;
  estimated_year: number | null;
  wedding_type: string[];
  region: string | null;
  county_code: string | null;
  county: string | null;
  locality: string | null;
  style: WeddingStyle | null;
  total_budget: number | null;
  currency: string;
  drink_mode: DrinkModeDb;
  budget_priorities: Json | null;
  music_choice: MusicChoiceDb | null;
  invitation_couple: string | null;
  invitation_message: string | null;
  invitation_published: boolean;
  created_at: string;
  updated_at: string;
};

export type WeddingMemberRow = {
  id: string;
  wedding_id: string;
  user_id: string | null;
  email: string;
  role: MemberRole;
  permission: MemberPermission;
  status: MemberStatus;
  invite_token: string;
  invited_at: string;
  joined_at: string | null;
};

export type EventSlotRow = {
  id: string;
  wedding_id: string;
  slot_type: SlotTypeDb;
  title: string | null;
  start_time: string | null;
  slot_time: string | null;
  duration_minutes: number | null;
  location_name: string | null;
  location_address: string | null;
  guests_adults: number;
  guests_children: number;
  serves_alcohol: boolean;
  serves_full_meal: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type CalcResultRow = {
  id: string;
  wedding_id: string;
  input_hash: string;
  results: Json;
  computed_at: string;
};

export type ConfigParameterRow = {
  id: string;
  region: string | null;
  key: string;
  value: Json;
  version: number;
  created_at: string;
};

export type LocalityRow = {
  id: number;
  county_code: string;
  county: string;
  name: string;
};

export type RsvpRow = {
  id: string;
  wedding_id: string;
  guest_name: string;
  attending: boolean;
  guests_count: number;
  adults_count: number;
  children_count: number;
  message: string | null;
  created_at: string;
};

export type VendorRow = {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  tier: VendorTierDb;
  regions: string[];
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number;
  verified: boolean;
  status: VendorStatus;
  stripe_connect_id: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadRow = {
  id: string;
  wedding_id: string;
  vendor_id: string;
  client_email: string;
  client_phone: string | null;
  event_date: string | null;
  event_region: string | null;
  message: string | null;
  status: LeadStatus;
  is_unlocked_by_vendor: boolean;
  unlocked_at: string | null;
  vendor_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Forma întoarsă de RPC `vendor_leads()` — contact mascat dacă nedeblocat. */
export type VendorLeadRow = {
  id: string;
  wedding_id: string;
  vendor_id: string;
  client_email: string | null;
  client_phone: string | null;
  event_date: string | null;
  event_region: string | null;
  message: string | null;
  status: LeadStatus;
  is_unlocked_by_vendor: boolean;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  lead_id: string | null;
  vendor_id: string;
  wedding_id: string;
  author_role: ReviewRole;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  vendor_id: string;
  lead_id: string | null;
  payment_type: PaymentType;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export type VendorMediaRow = {
  id: string;
  vendor_id: string;
  type: VendorMediaType;
  url: string;
  title: string | null;
  position: number;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  vendor_id: string;
  tier: VendorTierDb;
  monthly_price: number;
  subscription_start_date: string;
  renewal_day_of_month: number | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  next_renewal_date: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

type TableShape<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<
        ProfileRow,
        Partial<ProfileRow> & { id: string },
        Partial<ProfileRow>
      >;
      weddings: TableShape<
        WeddingRow,
        Partial<WeddingRow> & { name: string },
        Partial<WeddingRow>
      >;
      wedding_members: TableShape<
        WeddingMemberRow,
        Partial<WeddingMemberRow> & {
          wedding_id: string;
          email: string;
          role: MemberRole;
        },
        Partial<WeddingMemberRow>
      >;
      event_slots: TableShape<
        EventSlotRow,
        Partial<EventSlotRow> & { wedding_id: string; slot_type: SlotTypeDb },
        Partial<EventSlotRow>
      >;
      calc_results: TableShape<
        CalcResultRow,
        Partial<CalcResultRow> & {
          wedding_id: string;
          input_hash: string;
          results: Json;
        },
        Partial<CalcResultRow>
      >;
      config_parameters: TableShape<
        ConfigParameterRow,
        Partial<ConfigParameterRow> & { key: string; value: Json },
        Partial<ConfigParameterRow>
      >;
      localities: TableShape<
        LocalityRow,
        Partial<LocalityRow> & {
          county_code: string;
          county: string;
          name: string;
        },
        Partial<LocalityRow>
      >;
      rsvps: TableShape<
        RsvpRow,
        Partial<RsvpRow> & { wedding_id: string; guest_name: string },
        Partial<RsvpRow>
      >;
      vendors: TableShape<
        VendorRow,
        Partial<VendorRow> & {
          user_id: string;
          business_name: string;
          category: string;
          tier: VendorTierDb;
        },
        Partial<VendorRow>
      >;
      leads: TableShape<
        LeadRow,
        Partial<LeadRow> & {
          wedding_id: string;
          vendor_id: string;
          client_email: string;
        },
        Partial<LeadRow>
      >;
      reviews: TableShape<
        ReviewRow,
        Partial<ReviewRow> & {
          vendor_id: string;
          wedding_id: string;
          author_role: ReviewRole;
          rating: number;
        },
        Partial<ReviewRow>
      >;
      payments: TableShape<
        PaymentRow,
        Partial<PaymentRow> & {
          vendor_id: string;
          payment_type: PaymentType;
          amount: number;
        },
        Partial<PaymentRow>
      >;
      subscriptions: TableShape<
        SubscriptionRow,
        Partial<SubscriptionRow> & {
          vendor_id: string;
          tier: VendorTierDb;
          monthly_price: number;
        },
        Partial<SubscriptionRow>
      >;
      vendor_media: TableShape<
        VendorMediaRow,
        Partial<VendorMediaRow> & {
          vendor_id: string;
          type: VendorMediaType;
          url: string;
        },
        Partial<VendorMediaRow>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_wedding: {
        Args: { p_name: string; p_region?: string | null };
        Returns: WeddingRow;
      };
      accept_invite: {
        Args: { p_token: string };
        Returns: WeddingMemberRow;
      };
      is_wedding_member: {
        Args: { wid: string };
        Returns: boolean;
      };
      has_wedding_permission: {
        Args: { wid: string; perms: MemberPermission[] };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_lead: {
        Args: {
          p_wedding_id: string;
          p_vendor_id: string;
          p_message?: string | null;
          p_client_phone?: string | null;
        };
        Returns: LeadRow;
      };
      vendor_leads: {
        Args: Record<string, never>;
        Returns: VendorLeadRow[];
      };
      set_lead_status: {
        Args: { p_lead_id: string; p_status: LeadStatus };
        Returns: undefined;
      };
    };
    Enums: {
      user_type: UserType;
      date_status: DateStatus;
      season: Season;
      wedding_style: WeddingStyle;
      drink_mode: DrinkModeDb;
      member_role: MemberRole;
      member_permission: MemberPermission;
      member_status: MemberStatus;
      slot_type: SlotTypeDb;
      vendor_tier: VendorTierDb;
      vendor_status: VendorStatus;
      lead_status: LeadStatus;
      payment_type: PaymentType;
      payment_status: PaymentStatus;
      subscription_status: SubscriptionStatus;
      review_role: ReviewRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
