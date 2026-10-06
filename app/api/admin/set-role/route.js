import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ROLES = ["candidate", "interviewer", "recruiter", "admin"];

function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("users");
}

// POST /api/admin/set-role  { email, role }  — admins with the users capability.
// Verifies the caller, then uses the service-role key to change the target
// user's role through set_user_role. Only a super-admin may grant 'admin'.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { email, role } = body || {};
  if (!email || !ROLES.includes(role)) {
    return NextResponse.json({ error: "email and a valid role are required" }, { status: 400 });
  }
  if (role === "admin" && !access.superAdmin) {
    return NextResponse.json({ error: "Only a super-admin can grant the admin role." }, { status: 403 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Look up the target to guard self-demotion and to clear group on demotion.
  const { data: target } = await admin.from("profiles").select("id, role").ilike("email", email).maybeSingle();
  if (target && target.id === access.id && role !== "admin") {
    return NextResponse.json({ error: "You can't change your own admin role." }, { status: 400 });
  }

  const { data, error } = await admin.rpc("set_user_role", { user_email: email, new_role: role });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // A user who is no longer an admin can't belong to an admin group.
  if (role !== "admin" && target?.id) {
    await admin.from("profiles").update({ group_id: null }).eq("id", target.id);
  }
  return NextResponse.json({ ok: true, message: data });
}
