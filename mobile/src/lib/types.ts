/**
 * Tipuri pentru tabelele folosite de aplicația mobilă (subset din schema Fazei 1).
 * Oglindesc `src/lib/supabase/database.types.ts` din site.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  user_type: "client" | "vendor";
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
  county_code: string | null;
  county: string | null;
  locality: string | null;
  guests_adults: number;
  guests_children: number;
  serves_alcohol: boolean;
  serves_full_meal: boolean;
  order_index: number;
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

export type ConfigParameterRow = {
  id: string;
  region: string | null;
  key: string;
  value: Json;
  version: number;
  created_at: string;
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
      event_slots: TableShape<
        EventSlotRow,
        Partial<EventSlotRow> & { wedding_id: string; slot_type: SlotTypeDb },
        Partial<EventSlotRow>
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
      config_parameters: TableShape<
        ConfigParameterRow,
        Partial<ConfigParameterRow> & { key: string; value: Json },
        Partial<ConfigParameterRow>
      >;
      rsvps: TableShape<
        RsvpRow,
        Partial<RsvpRow> & { wedding_id: string; guest_name: string },
        Partial<RsvpRow>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_wedding: {
        Args: { p_name: string; p_region?: string | null };
        Returns: WeddingRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
