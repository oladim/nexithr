import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } from "./config";

// API routes that keep working during maintenance (admin tools, sign-in
// 2FA, read-only config, payment confirmation for money already taken).
const MAINTENANCE_EXEMPT = ["/api/admin", "/api/2fa", "/api/settings", "/api/maintenance", "/api/events", "/api/payments/paystack/verify", "/api/certificate/verify"];
const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

// Route groups that require a signed-in user.
const PROTECTED = ["/dashboard", "/interviewer", "/recruiter", "/admin"];

// Refreshes the auth session cookie and guards protected routes.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  // Demo mode (no keys): don't gate anything.
  if (!SUPABASE_ENABLED) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  // Maintenance: block every write API for non-admins while it's active.
  // (Direct browser writes are blocked by RLS — see migration 0027.)
  if (user && path.startsWith("/api/") && WRITE_METHODS.includes(request.method)
      && !MAINTENANCE_EXEMPT.some((p) => path === p || path.startsWith(p + "/"))) {
    try {
      const { data: active, error } = await supabase.rpc("in_maintenance");
      if (!error && active === true) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        if (prof?.role !== "admin") {
          return NextResponse.json(
            { error: "NexIT-Africa is under maintenance. Please try again once it's finished.", maintenance: true },
            { status: 503, headers: { "Retry-After": "600" } }
          );
        }
      }
    } catch { /* pre-0027 schema — don't block */ }
  }

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}
