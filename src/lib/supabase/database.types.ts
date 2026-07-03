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
  user_type: UserType;
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
    };
    CompositeTypes: Record<string, never>;
  };
}
