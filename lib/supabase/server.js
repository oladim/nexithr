import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } from "./config";

// Server Supabase client bound to the request cookies (App Router).
// Returns null when Supabase isn't configured.
export async function getServerSupabase() {
  if (!SUPABASE_ENABLED) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // called from a Server Component — safe to ignore; middleware refreshes
        }
      },
    },
  });
}

// Convenience: the current signed-in user's profile (with role) or null.
export async function getSessionProfile() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return profile ? { ...profile, authEmail: user.email } : null;
}

// The current user's RBAC access descriptor for the admin portal:
//   { role, superAdmin, permissions, totpEnabled, groupId }
// A super-admin is an admin with no group (holds every permission).
// Non-admins get superAdmin:false and no permissions.
export async function getSessionAccess() {
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const me = await getSessionProfile();
  if (!me) return null;

  const base = {
    id: me.id,
    role: me.role,
    totpEnabled: !!me.totp_enabled,
    groupId: me.group_id || null,
    superAdmin: false,
    permissions: [],
  };
  if (me.role !== "admin") return base;
  if (!me.group_id) return { ...base, superAdmin: true };

  const { data: group } = await supabase
    .from("groups")
    .select("permissions")
    .eq("id", me.group_id)
    .maybeSingle();
  return { ...base, permissions: Array.isArray(group?.permissions) ? group.permissions : [] };
}
