// Central place to read Supabase env + a flag the whole app branches on.
// When the keys are absent, the app runs in its original front-end-only demo
// mode (localStorage). When present, it uses the real database + auth.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Truthy only when both public keys are configured.
export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
