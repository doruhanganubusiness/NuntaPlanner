/** Acces validat la variabilele de mediu Supabase (evaluat lazy, la runtime). */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variabila de mediu ${name} lipsește. Copiază .env.example în .env.local și completeaz-o.`,
    );
  }
  return value;
}

export const supabaseUrl = () =>
  required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const supabaseAnonKey = () =>
  required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

/** Cheia service-role — doar pe server, pentru operații privilegiate. */
export const serviceRoleKey = () =>
  required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
