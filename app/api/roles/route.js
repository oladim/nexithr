import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/roles — the target roles currently OPEN for applications (approved
// by an admin in Role Requirements). Public: the signup form needs it before
// the visitor has an account. Only non-sensitive fields are returned.
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ roles: null }); // not configured → client falls back
  const { data, error } = await admin
    .from("role_requirements")
    .select("role_key, title, description, enabled")
    .order("title", { ascending: true });
  if (error) return NextResponse.json({ roles: null });
  const roles = (data || [])
    .filter((r) => r.enabled !== false)
    .map((r) => ({ key: r.role_key, title: r.title, description: (r.description || "").slice(0, 140) }));
  return NextResponse.json({ roles });
}
