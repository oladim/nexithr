import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET /api/me/permissions — the signed-in user's RBAC access descriptor,
// used by the admin layout to filter the nav and guard pages.
export async function GET() {
  const access = await getSessionAccess();
  if (!access) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({
    role: access.role,
    superAdmin: access.superAdmin,
    permissions: access.permissions,
    totpEnabled: access.totpEnabled,
    groupId: access.groupId,
  });
}
