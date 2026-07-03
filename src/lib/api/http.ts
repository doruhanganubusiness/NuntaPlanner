import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Răspuns JSON de succes. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** Răspuns JSON de eroare. */
export function fail(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Obține userul autentificat sau returnează 401.
 * Întoarce clientul Supabase (cu contextul userului) pentru refolosire.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, unauthorized: fail("Neautentificat", 401) };
  }
  return { supabase, user, unauthorized: null as null };
}

/** Parsează body-ul JSON în siguranță. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
