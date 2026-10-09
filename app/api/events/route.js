import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { alertAdmins } from "@/lib/adminAlert";
import { ROLE_LABELS } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/events  { type, id? }
// Lets the browser report actions it performs directly against Supabase
// (sign-up, CV upload, job post, hire request, staff documents) so the team
// inbox gets an email. Nothing is trusted from the client except the event
// type and an id: every fact is re-read from the database server-side, the
// row must belong to the signed-in user, and each event emails at most once.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ ok: false });

  const who = me.full_name || me.email || "A user";
  const email = me.email || me.authEmail || "";
  let r = { skipped: true };

  switch (body?.type) {
    case "registered": {
      if (me.role === "admin") break;
      // Only genuinely new accounts (avoids emailing about existing users the
      // first time they sign in after this feature ships).
      if (me.created_at && Date.now() - new Date(me.created_at).getTime() > 7 * 86400000) break;
      const roleName = me.role === "interviewer" ? "interviewer" : me.role === "recruiter" ? "recruiter / employer" : "candidate";
      let extra = [];
      if (me.role === "candidate") {
        const { data: c } = await admin.from("candidates").select("target_role, interested_role").eq("id", me.id).maybeSingle();
        extra = [["Target role", ROLE_LABELS[c?.target_role] || c?.target_role || "—"], ["Waiting for role", c?.interested_role]];
      } else if (me.role === "interviewer") {
        const { data: iv } = await admin.from("interviewers").select("kind").eq("id", me.id).maybeSingle();
        extra = [["Interviewer type", iv?.kind]];
      }
      const pending = (me.approval_status || "approved") === "pending";
      r = await alertAdmins(admin, {
        key: `registered:${me.id}`,
        category: "registrations",
        subject: `New ${roleName} sign-up — ${who}${pending ? " (awaiting approval)" : ""}`,
        summary: pending ? `${who} registered as ${roleName} and is waiting for approval.` : `${who} created a ${roleName} account.`,
        details: [["Name", who], ["Email", email], ["Phone", me.phone], ...extra],
        cta: pending ? { label: "Review staff approvals", path: "/admin/staff-approvals" } : { label: "Open admin", path: "/admin/users" },
      });
      break;
    }
    case "cv_uploaded": {
      if (me.role !== "candidate") break;
      const { data: cv } = await admin.from("cvs").select("id, file_name, status, uploaded_at").eq("candidate_id", me.id).order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
      if (!cv || cv.status !== "Pending review") break;
      const { data: c } = await admin.from("candidates").select("target_role").eq("id", me.id).maybeSingle();
      r = await alertAdmins(admin, {
        key: `cv:${cv.id}`,
        category: "cvs",
        subject: `CV awaiting review — ${who}`,
        summary: `${who} uploaded a CV. It needs to be approved before they can take the AI interview.`,
        details: [["Candidate", who], ["Email", email], ["Target role", ROLE_LABELS[c?.target_role] || c?.target_role || "—"], ["File", cv.file_name]],
        cta: { label: "Review CVs", path: "/admin/cv-reviews" },
      });
      break;
    }
    case "job_posted": {
      if (me.role !== "recruiter" || !body?.id) break;
      const { data: job } = await admin.from("jobs").select("id, title, company, type, location, status, posted_by").eq("id", body.id).maybeSingle();
      if (!job || job.posted_by !== me.id) break;
      r = await alertAdmins(admin, {
        key: `job:${job.id}`,
        category: "jobs",
        subject: `Job posted for approval — ${job.title}`,
        summary: `${who} posted a job that ${job.status === "pending" ? "needs your approval before candidates can see it" : "is now live"}.`,
        details: [["Title", job.title], ["Company", job.company], ["Type", job.type], ["Location", job.location], ["Posted by", `${who} (${email})`]],
        cta: { label: "Review jobs", path: "/admin/jobs" },
      });
      break;
    }
    case "hire_request": {
      if (me.role !== "recruiter" || !body?.id) break;
      const { data: hr } = await admin.from("hire_requests").select("*").eq("id", body.id).maybeSingle();
      if (!hr || hr.recruiter_id !== me.id) break;
      const { data: cand } = await admin.from("profiles").select("full_name").eq("id", hr.candidate_id).maybeSingle();
      r = await alertAdmins(admin, {
        key: `hire:${hr.id}`,
        category: "jobs",
        subject: `Hire request — ${cand?.full_name || "a candidate"}`,
        summary: `${who} wants to hire ${cand?.full_name || "a candidate"} from the board.`,
        details: [["Employer", `${who} (${email})`], ["Candidate", cand?.full_name], ["Position", hr.position]],
        cta: { label: "Open hire requests", path: "/admin/hire-requests" },
      });
      break;
    }
    case "staff_docs": {
      if (!["interviewer", "recruiter"].includes(me.role)) break;
      const { data: app } = await admin.from("staff_applications").select("doc_name").eq("user_id", me.id).maybeSingle();
      if (!app?.doc_name) break;
      r = await alertAdmins(admin, {
        key: `staffdoc:${me.id}:${app.doc_name}`,
        category: "registrations",
        subject: `Documents uploaded for approval — ${who}`,
        summary: `${who} (${me.role}) uploaded their verification document.`,
        details: [["Name", who], ["Email", email], ["Document", app.doc_name]],
        cta: { label: "Review staff approvals", path: "/admin/staff-approvals" },
      });
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, sent: !!r.sent });
}
