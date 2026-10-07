import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { formatIssued } from "@/lib/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/certificate/verify?id=NXA-2026-XXXXXXXX — PUBLIC authenticity
// check. Returns only what is printed on the certificate itself (name, role,
// date) plus whether it is currently valid. No contact details are exposed.
export async function GET(request) {
  const id = (new URL(request.url).searchParams.get("id") || "").trim().toUpperCase();
  if (!/^NXA-\d{4}-[0-9A-F]{8}$/.test(id)) return NextResponse.json({ found: false });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: cert } = await admin.from("certificates").select("id, candidate_id, full_name, role_label, issued_at, revoked").eq("id", id).maybeSingle();
  if (!cert) return NextResponse.json({ found: false });
  const { data: cand } = await admin.from("candidates").select("on_board").eq("id", cert.candidate_id).maybeSingle();
  const valid = !cert.revoked && !!cand?.on_board;
  return NextResponse.json({
    found: true,
    valid,
    id: cert.id,
    name: cert.full_name,
    role: cert.role_label,
    date: formatIssued(cert.issued_at),
  });
}
