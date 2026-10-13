import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Handles the email-confirmation / magic link. Supabase redirects here with a
// `code` that we exchange for a session, then send the user to their portal.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only same-site paths (blocks "//evil.com" style open redirects).
  const rawNext = searchParams.get("next") || "/dashboard";
  const next = /^\/(?!\/)[\w\-/?=&.%]*$/.test(rawNext) ? rawNext : "/dashboard";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  // Something went wrong. A password-reset link that failed goes back to the
  // reset page (it explains and offers a new code); anything else → login.
  if (next.startsWith("/reset-password")) return NextResponse.redirect(`${origin}/reset-password`);
  return NextResponse.redirect(`${origin}/login?confirmed=0`);
}
