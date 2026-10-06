import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("notifications");
}

// GET /api/admin/notifications — recent platform notifications across all
// users (newest first), with the recipient's name. Admins with the
// notifications capability only.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data, error } = await admin
    .from("notifications")
    .select("id, title, body, read, created_at, profiles:user_id(full_name, email, role)")
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.created_at,
    recipient: n.profiles?.full_name || n.profiles?.email || "User",
    recipientRole: n.profiles?.role || null,
  }));
  return NextResponse.json({ notifications: rows });
}
