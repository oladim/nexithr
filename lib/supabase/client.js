"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } from "./config";

// Browser Supabase client (singleton). Returns null when Supabase isn't
// configured, so callers can fall back to demo mode.
let _client = null;

export function getBrowserSupabase() {
  if (!SUPABASE_ENABLED) return null;
  if (_client) return _client;
  _client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}
