import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadTestimonials } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/testimonials — published graduate outcomes (public).
export async function GET() {
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ testimonials: [] });
  try {
    const rows = await loadTestimonials(admin, true);
    return NextResponse.json({
      testimonials: rows.map((t) => ({
        id: t.id, name: t.name, role: t.role, company: t.company, quote: t.quote, outcome: t.outcome,
      })),
    });
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}
