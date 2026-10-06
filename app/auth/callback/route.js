import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

// Handles the email-confirmation / magic link. Supabase redirects here with a
// `code` that we exchange for a session, then send the user to their portal.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  // Something went wrong — send them to login with a flag.
  return NextResponse.redirect(`${origin}/login?confirmed=0`);
}
