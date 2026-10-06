import { NextResponse } from "next/server";
import { getServerSupabase, getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ROLES = ["candidate", "interviewer", "recruiter", "admin"];

// Who may manage users: a super-admin, or an admin with the "users" permission.
function canManage(access) {
  if (!access || access.role !== "admin") return false;
  return access.superAdmin || access.permissions.includes("users");
}

// GET /api/admin/users — list all profiles (with group + 2FA state) and the
// groups available for assignment. Requires the "users" capability.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await getServerSupabase();
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, group_id, totp_enabled, approval_status, created_at")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name, permissions")
    .order("name", { ascending: true });

  return NextResponse.json({
    users,
    groups: groups || [],
    meId: access.id,
    superAdmin: access.superAdmin,
  });
}

// POST /api/admin/users — create a new user.
//   { email, password, fullName, role, groupId?, interviewerKind?, orgName? }
// Uses the service role to create the auth user (email pre-confirmed) and set
// its role/approval. Only a super-admin may create another admin.
export async function POST(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const email = (body?.email || "").trim().toLowerCase();
  const password = body?.password || "";
  const fullName = (body?.fullName || "").trim();
  const role = body?.role;
  const groupId = body?.groupId || null;

  if (!email || !password) return NextResponse.json({ error: "Email and a temporary password are required." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (!ROLES.includes(role)) return NextResponse.json({ error: "A valid role is required." }, { status: 400 });
  if (role === "admin" && !access.superAdmin) {
    return NextResponse.json({ error: "Only a super-admin can create another admin." }, { status: 403 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const kind = body?.interviewerKind === "HR" ? "HR" : "Professional";
  // Create the auth user. The handle_new_user trigger builds the profile (it
  // clamps role to candidate/interviewer/recruiter for safety); we then set
  // the final role server-side below so admins can be created here.
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || email.split("@")[0],
      role: role === "admin" ? "candidate" : role, // trigger-safe; fixed up next
      interviewer_kind: kind,
      org_name: body?.orgName || "",
    },
  });
  if (cErr) {
    const msg = /already.*registered|exists/i.test(cErr.message) ? "A user with that email already exists." : cErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const uid = created?.user?.id;

  // Apply the final role via the privileged RPC (ensures sub-rows exist).
  const { error: rErr } = await admin.rpc("set_user_role", { user_email: email, new_role: role });
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  // Staff/admin created by an admin are approved immediately; set group too.
  const patch = { approval_status: "approved" };
  if (role === "admin") patch.group_id = groupId; // only admins carry a group
  if (fullName) patch.full_name = fullName;
  if (uid) await admin.from("profiles").update(patch).eq("id", uid);
  // Keep any staff_application in sync so the gate doesn't block them.
  if (uid && (role === "interviewer" || role === "recruiter")) {
    await admin.from("staff_applications").update({ status: "approved" }).eq("user_id", uid);
  }

  return NextResponse.json({ ok: true, userId: uid, message: `${email} created as ${role}.` });
}

// PATCH /api/admin/users  { userId, groupId } — (re)assign an admin to a group
// (or null to make them a super-admin). Only applies to admin-role users.
export async function PATCH(request) {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!canManage(access)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const userId = body?.userId;
  const groupId = body?.groupId || null;
  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });

  // Guard: an admin can't drop their own super-admin status or move their own
  // group unless they're a super-admin (prevents self-lockout).
  if (userId === access.id && !access.superAdmin) {
    return NextResponse.json({ error: "You can't change your own group." }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Only admins carry a group; refuse assigning a group to a non-admin.
  const { data: target } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.role !== "admin" && groupId) {
    return NextResponse.json({ error: "Only admin users can be placed in a group. Change the role to admin first." }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update({ group_id: groupId }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
