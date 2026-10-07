import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("role_requirements");
}

// Candidates who registered without an open target role (the waitlist).
async function waitlist(admin) {
  const { data } = await admin.from("candidates").select("id, interested_role").is("target_role", null);
  const { data: blank } = await admin.from("candidates").select("id, interested_role").eq("target_role", "");
  return [...(data || []), ...(blank || [])];
}

// GET /api/admin/roles — waitlist summary: how many candidates are waiting,
// grouped by the field they said they're interested in.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const rows = await waitlist(admin);
  const counts = {};
  rows.forEach((r) => {
    const k = (r.interested_role || "").trim() || "Not specified";
    counts[k] = (counts[k] || 0) + 1;
  });
  const interests = Object.entries(counts).map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count);
  return NextResponse.json({ total: rows.length, interests });
}

// POST /api/admin/roles  { roleKey }
// A role has just been opened — tell everyone on the waitlist it's available.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { data: role } = await admin.from("role_requirements").select("role_key, title, enabled").eq("role_key", body?.roleKey || "").maybeSingle();
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });
  if (role.enabled === false) return NextResponse.json({ error: "That role isn't open for applications." }, { status: 400 });

  const rows = await waitlist(admin);
  let notified = 0;
  for (const r of rows) {
    await notifyUser(admin, {
      userId: r.id,
      title: `${role.title} is now open on NexIT-Africa`,
      body: `Good news — a new position is now available: ${role.title}. Choose it as your target role in your profile, upload your CV and take your AI interview to get started.`,
      cta: { label: "Choose my target role", path: "/dashboard/profile" },
    });
    notified++;
  }
  return NextResponse.json({ ok: true, notified });
}
