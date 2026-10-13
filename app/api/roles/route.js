import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/roles — the target roles currently OPEN for applications (approved
// by an admin in Role Requirements), grouped by area. Public: the sign-up form
// needs it before the visitor has an account. Only non-sensitive fields.
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ roles: null, areas: null }); // not configured → client falls back
  let { data, error } = await admin
    .from("role_requirements")
    .select("role_key, title, description, enabled, kind, area_key, base_role, base_title, level, min_experience, sort")
    .order("sort", { ascending: true });
  if (error) {
    // Pre-0029 schema: fall back to the basic columns.
    ({ data, error } = await admin.from("role_requirements").select("role_key, title, description, enabled").order("title", { ascending: true }));
    if (error) return NextResponse.json({ roles: null, areas: null });
  }
  const open = (data || []).filter((r) => r.enabled !== false);
  // Once the role catalog exists, the old one-per-area roles are hidden.
  const hasCatalog = open.some((r) => r.kind === "role" && r.level);
  const list = hasCatalog ? open.filter((r) => r.kind === "role" && r.level) : open;
  const { data: areas } = hasCatalog
    ? await admin.from("role_areas").select("key, title, summary, sort").order("sort", { ascending: true })
    : { data: null };
  return NextResponse.json({
    areas: areas || null,
    roles: list.map((r) => ({
      key: r.role_key, title: r.title,
      description: (r.description || "").split("\n")[0].slice(0, 180),
      area: r.area_key || null, base: r.base_role || null, baseTitle: r.base_title || null,
      level: r.level || null, minYears: r.min_experience ?? null,
    })),
  });
}
