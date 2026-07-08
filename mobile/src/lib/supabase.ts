import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import type { Database } from "./types";

/**
 * Clientul Supabase pentru aplicația mobilă. Se conectează la ACELAȘI proiect
 * ca site-ul, deci mirii folosesc același cont și aceleași date.
 *
 * Sesiunea se persistă în AsyncStorage. `detectSessionInUrl` e false (nu suntem
 * într-un browser). Cheile pot fi suprascrise din variabile de mediu
 * (EXPO_PUBLIC_*), altfel folosim valorile proiectului live.
 */
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  "https://iwakrrugfdtslficmori.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3YWtycnVnZmR0c2xmaWNtb3JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MDUxMjksImV4cCI6MjA5ODI4MTEyOX0.soVzfNy3EYekfXQwz-8WUZjpXApWaOg6ch6EDe_Al_U";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
