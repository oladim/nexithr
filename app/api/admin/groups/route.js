import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { PERMISSION_KEYS } from "@/lib/permissions";

export const runtime = "nodejs";

// Only a super-admin, or an admin with the "users" permission, may manage
// groups. (Managing who-can-do-what is itself a sensitive capability.)
function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("users");
}

const cleanPerms = (arr) =>
  Array.isArray(arr) ? [...new Set(arr.filter((k) => PERMISSION_KEYS.includes(k)))] : [];

// GET /api/admin/groups — list groups with member counts.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: groups, error } = await admin
    .from("groups")
    .select("id, name, description, permissions, created_at")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Member counts per group.
  const { data: members } = await admin.from("profiles").select("group_id").not("group_id", "is", null);
  const counts = {};
  (members || []).forEach((m) => { counts[m.group_id] = (counts[m.group_id] || 0) + 1; });

  return NextResponse.json({
    groups: (groups || []).map((g) => ({ ...g, memberCount: counts[g.id] || 0 })),
  });
}

// POST /api/admin/groups  { name, description, permissions[] } — create.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const name = (body?.name || "").trim();
  if (!name) return NextResponse.json({ error: "A group name is required." }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("groups")
    .insert({ name, description: body?.description || null, permissions: cleanPerms(body?.permissions) })
    .select("id, name, description, permissions, created_at")
    .single();
  if (error) {
    const msg = /duplicate|unique/i.test(error.message) ? "A group with that name already exists." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ group: { ...data, memberCount: 0 } });
}

// PATCH /api/admin/groups  { id, name?, description?, permissions? } — update.
export async function PATCH(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!body?.id) return NextResponse.json({ error: "Group id is required." }, { status: 400 });

  const patch = {};
  if (typeof body.name === "string") { const n = body.name.trim(); if (!n) return NextResponse.json({ error: "Name can't be empty." }, { status: 400 }); patch.name = n; }
  if (typeof body.description === "string") patch.description = body.description || null;
  if (body.permissions !== undefined) patch.permissions = cleanPerms(body.permissions);

  // Guard: don't let an admin edit their OWN group to drop the "users"
  // permission (and lock themselves out of group management), unless they're
  // a super-admin acting on someone else's group.
  if (!access.superAdmin && body.id === access.groupId && patch.permissions && !patch.permissions.includes("users")) {
    return NextResponse.json({ error: "You can't remove your own group's Users & Groups permission." }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { data, error } = await admin
    .from("groups").update(patch).eq("id", body.id)
    .select("id, name, description, permissions, created_at").single();
  if (error) {
    const msg = /duplicate|unique/i.test(error.message) ? "A group with that name already exists." : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ group: data });
}

// DELETE /api/admin/groups?id=... — delete a group (members fall back to
// super-admin via group_id → null on delete).
export async function DELETE(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Group id is required." }, { status: 400 });
  if (id === access.groupId && !access.superAdmin) {
    return NextResponse.json({ error: "You can't delete your own group." }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const { error } = await admin.from("groups").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
