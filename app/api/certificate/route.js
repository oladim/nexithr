import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { getOrIssueCertificate, verifyUrl, formatIssued } from "@/lib/certificate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/certificate — the signed-in candidate's certificate. It is issued
// the first time it's requested after they pass ALL stages (AI, Professional,
// HR). Returns { eligible:false } until then.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  let cert;
  try { cert = await getOrIssueCertificate(admin, me.id); }
  catch (e) { return NextResponse.json({ error: e.message || "Couldn't load your certificate" }, { status: 500 }); }
  if (!cert) return NextResponse.json({ eligible: false });
  if (cert.revoked) return NextResponse.json({ eligible: false, revoked: true });

  const url = verifyUrl(cert.id);
  const qr = await QRCode.toDataURL(url, { margin: 0, width: 240, errorCorrectionLevel: "M", color: { dark: "#0a0f1e", light: "#ffffff" } });
  return NextResponse.json({
    eligible: true,
    certificate: {
      id: cert.id,
      name: cert.full_name,
      role: cert.role_label,
      issuedAt: cert.issued_at,
      date: formatIssued(cert.issued_at),
      year: new Date(cert.issued_at).getFullYear(),
      verifyUrl: url,
      qr,
    },
  });
}
