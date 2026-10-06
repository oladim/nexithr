/**
 * Seed demo data into your Supabase project.
 *
 * Creates the demo accounts used by the login page's quick-portal links,
 * plus jobs, a few on-board candidates, interviewer notes, payments and
 * notifications so every portal shows real rows.
 *
 * Usage:
 *   1. Run the SQL migrations first (see SETUP.md).
 *   2. Fill .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 *   3. node scripts/seed-demo.mjs
 *
 * Safe to re-run: existing users are reused, not duplicated.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// --- load env from .env.local (no dotenv dependency) ---
function loadEnv() {
  try {
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* rely on real env */
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set them in .env.local).");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
const PASSWORD = "Password123!";

async function ensureUser(email, meta) {
  // find existing
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) return existing.id;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  return data.user.id;
}

const CANDIDATE_SKILLS = { software: ["React", "Node js", "SQL"], data: ["Python", "SQL", "BI"], product: ["Figma", "Research", "UI"] };

async function main() {
  console.log("Seeding demo accounts…");

  // Core demo accounts (login quick-links).
  await ensureUser("candidate@nexit.africa", { role: "candidate", full_name: "Lawal Paul Tomisin", target_role: "software", experience: "4 Years", skills: "React, Node js, SQL", job_type: "Full-time" });
  await ensureUser("interviewer@nexit.africa", { role: "interviewer", full_name: "Paul Tomisin", interviewer_kind: "Professional" });
  await ensureUser("interviewer2@nexit.africa", { role: "interviewer", full_name: "David Okon", interviewer_kind: "Professional" });
  await ensureUser("hr@nexit.africa", { role: "interviewer", full_name: "Grace Umeh", interviewer_kind: "HR" });
  await ensureUser("recruiter@nexit.africa", { role: "recruiter", full_name: "Adeyemi John Ayodele" });
  await ensureUser("admin@nexit.africa", { role: "admin", full_name: "Adebayo Peter John" });

  // A handful of on-board candidates for the recruiter board.
  const board = [
    { email: "ada@nexit.africa", name: "Ada Obi", role: "software", exp: "5 Years", top: "React" },
    { email: "musa@nexit.africa", name: "Musa Bello", role: "data", exp: "3 Years", top: "Python" },
    { email: "rose@nexit.africa", name: "Rose Adeyemi", role: "product", exp: "4 Years", top: "Figma" },
    { email: "kate@nexit.africa", name: "Kate Morrison", role: "software", exp: "6 Years", top: "Node" },
  ];
  for (const b of board) {
    const id = await ensureUser(b.email, { role: "candidate", full_name: b.name, target_role: b.role, experience: b.exp, skills: (CANDIDATE_SKILLS[b.role] || []).join(", ") });
    await admin.from("candidates").update({ on_board: true, avg_score: 4.2, top_skill: b.top, kyc: "Verified", skills: CANDIDATE_SKILLS[b.role] || [] }).eq("id", id);
  }
  console.log("  ✓ accounts + board candidates");

  // Seed a few CV submissions for the admin review queue.
  {
    const emails = ["ada@nexit.africa", "musa@nexit.africa", "rose@nexit.africa"];
    const { data: profs } = await admin.from("profiles").select("id, full_name, email").in("email", emails);
    for (const p of profs || []) {
      const { data: has } = await admin.from("cvs").select("id").eq("candidate_id", p.id).limit(1);
      if (has?.length) continue;
      const nameSlug = (p.full_name || "cv").replace(/\s+/g, "_");
      const isRose = p.email === "rose@nexit.africa";
      await admin.from("cvs").insert({
        candidate_id: p.id,
        file_name: `${nameSlug}_CV.pdf`,
        industry: isRose ? "Product & Design" : "Software",
        job_type: "Full-time",
        status: isRose ? "Approved" : "Pending review",
        review_note: isRose ? "Strong portfolio — advanced to AI interview." : null,
      });
    }
    console.log("  ✓ cv submissions");
  }

  // Jobs.
  const jobs = [
    { title: "UX Designer", company: "PayStack", type: "Full-time", location: "Remote" },
    { title: "Frontend Developer", company: "Flutterwave", type: "Full-time", location: "Hybrid" },
    { title: "Backend Engineer", company: "Andela", type: "Contract", location: "Remote" },
    { title: "Data Analyst", company: "Kuda", type: "Full-time", location: "Lagos" },
  ];
  // avoid dupes by title+company
  const { data: existingJobs } = await admin.from("jobs").select("title, company");
  const have = new Set((existingJobs || []).map((j) => `${j.title}|${j.company}`));
  const toAdd = jobs.filter((j) => !have.has(`${j.title}|${j.company}`));
  if (toAdd.length) await admin.from("jobs").insert(toAdd);
  console.log(`  ✓ jobs (${toAdd.length} new)`);

  // Interviewer payments (earnings) + a notification for the candidate.
  const { data: ivUser } = await admin.from("profiles").select("id").eq("email", "interviewer@nexit.africa").single();
  if (ivUser) {
    const { data: pays } = await admin.from("payments").select("id").eq("interviewer_id", ivUser.id).limit(1);
    if (!pays?.length) {
      await admin.from("payments").insert([
        { interviewer_id: ivUser.id, candidate_name: "Rose Mary", position: "Full Stack Dev", amount: 50, status: "Pending" },
        { interviewer_id: ivUser.id, candidate_name: "John Wale", position: "Product Designer", amount: 70, status: "Paid" },
        { interviewer_id: ivUser.id, candidate_name: "Musa Bello", position: "Backend Dev", amount: 50, status: "Paid" },
      ]);
    }
  }

  // Assign a few interviews + notes to the interviewer so their dashboard is live.
  if (ivUser) {
    const { data: cands } = await admin
      .from("candidates")
      .select("id, target_role, profiles(full_name)")
      .in("id", (await admin.from("profiles").select("id").in("email", ["ada@nexit.africa", "musa@nexit.africa", "rose@nexit.africa"])).data?.map((p) => p.id) || []);
    const { data: existingIv } = await admin.from("interviews").select("id").eq("interviewer_id", ivUser.id).limit(1);
    if (!existingIv?.length && cands?.length) {
      const dates = ["Aug 1, 2025", "Aug 3, 2025", "Aug 5, 2025"];
      const statuses = ["Completed", "Confirmed", "Confirmed"];
      await admin.from("interviews").insert(
        cands.map((c, i) => ({
          candidate_id: c.id,
          interviewer_id: ivUser.id,
          type: "Professional",
          mode: "Virtual",
          role: "Software Development",
          scheduled_date: dates[i % dates.length],
          status: statuses[i % statuses.length],
        }))
      );
      // Two panel notes on the same candidate/stage (multiple notes per stage).
      const { data: iv2 } = await admin.from("profiles").select("id").eq("email", "interviewer2@nexit.africa").maybeSingle();
      const notes = [
        { interviewer_id: ivUser.id, candidate_id: cands[0].id, stage: "Professional", rating: 4, strengths: "Strong React, clear communication", improvements: "Deeper system design", note: "Handled the frontend task cleanly." },
      ];
      if (iv2) notes.push({ interviewer_id: iv2.id, candidate_id: cands[0].id, stage: "Professional", rating: 5, strengths: "Excellent problem decomposition", improvements: "", note: "Great trade-off reasoning on the API design." });
      await admin.from("interviewer_notes").upsert(notes, { onConflict: "interviewer_id,candidate_id,stage" });
    }
  }

  const { data: candUser } = await admin.from("profiles").select("id").eq("email", "candidate@nexit.africa").single();
  if (candUser) {
    const { data: notes } = await admin.from("notifications").select("id").eq("user_id", candUser.id).limit(1);
    if (!notes?.length) {
      await admin.from("notifications").insert([
        { user_id: candUser.id, title: "AI interview passed", body: "You scored 88%. The Professional stage is now unlocked.", read: false },
        { user_id: candUser.id, title: "CV received", body: "Your CV is under review.", read: true },
      ]);
    }
  }
  console.log("  ✓ payments + notifications");

  console.log("\nDone. Demo logins (password: Password123!):");
  console.log("  candidate@nexit.africa · interviewer@nexit.africa · hr@nexit.africa · recruiter@nexit.africa · admin@nexit.africa");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
