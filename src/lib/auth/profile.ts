import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, UserType } from "@/lib/supabase/database.types";

export type CurrentProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  user_type: UserType;
  is_admin: boolean;
};

/**
 * Profilul userului curent (tip cont + flag admin), sau null dacă nu e logat.
 * Folosit pentru rutarea pe `user_type` și gating-ul zonelor privatate.
 */
export async function getCurrentProfile(
  supabase: SupabaseClient<Database>,
): Promise<CurrentProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, user_type, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    email: user.email ?? null,
    full_name: data.full_name,
    user_type: data.user_type,
    is_admin: data.is_admin,
  };
}

/** Destinația implicită după login, în funcție de tipul contului. */
export function homeForUserType(userType: UserType): string {
  return userType === "vendor" ? "/vendor" : "/dashboard";
}
