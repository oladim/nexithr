import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("landing");
}

// GET /api/admin/landing — all spotlights (any state) + the display count.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("landing_spotlights")
    .select("id, quote, name, role, image_url, sort, enabled, created_at")
    .order("sort", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: s } = await admin.from("app_settings").select("landing_spotlight_count").eq("id", 1).maybeSingle();
  return NextResponse.json({ spotlights: data || [], count: s?.landing_spotlight_count ?? 6 });
}

// POST /api/admin/landing { quote, name, role, image_url, sort, enabled }
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!body?.quote || !body.quote.trim()) return NextResponse.json({ error: "A quote/message is required." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const row = {
    quote: body.quote.trim(),
    name: body.name || null,
    role: body.role || null,
    image_url: body.image_url || null,
    sort: Number.isFinite(Number(body.sort)) ? Math.round(Number(body.sort)) : 0,
    enabled: body.enabled !== false,
  };
  const { data, error } = await admin.from("landing_spotlights").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ spotlight: data });
}

// PATCH /api/admin/landing — update a spotlight, or { count } to set how many show.
export async function PATCH(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Update the display count.
  if (body?.count !== undefined && !body.id) {
    const count = Math.max(0, Math.round(Number(body.count) || 0));
    const { error } = await admin.from("app_settings").update({ landing_spotlight_count: count, updated_at: new Date().toISOString() }).eq("id", 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, count });
  }

  if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  const patch = {};
  for (const k of ["quote", "name", "role", "image_url"]) if (typeof body[k] === "string") patch[k] = body[k] || null;
  if (body.sort !== undefined) patch.sort = Math.round(Number(body.sort) || 0);
  if (typeof body.enabled === "boolean") patch.enabled = body.enabled;

  const { data, error } = await admin.from("landing_spotlights").update(patch).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ spotlight: data });
}

// DELETE /api/admin/landing?id=...
export async function DELETE(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { error } = await admin.from("landing_spotlights").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
