"use client";

import { useState, useMemo, useEffect } from "react";
import { CANDIDATES, JOB_ROLES, LEVELS, LOCATIONS } from "@/components/recruiter/data";
import BoardCard from "@/components/recruiter/BoardCard";
import { IconFilter, IconChevronDown, IconBriefcase } from "@/components/Icons";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadBoardCandidates, mapBoardCandidate, createHireRequest } from "@/lib/db";
import { reportEvent } from "@/lib/events";

export default function CandidateList() {
  const { supabaseEnabled } = useAuth();
  const [role, setRole] = useState("All roles");
  const [level, setLevel] = useState("All levels");
  const [loc, setLoc] = useState("All locations");
  // Demo mode shows the illustrative board; real mode loads the live board.
  const [candidates, setCandidates] = useState(supabaseEnabled ? null : CANDIDATES);

  // Real mode: load the live candidate board (candidates who passed all stages).
  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setCandidates([]); return; }
      try { const rows = await loadBoardCandidates(sb); setCandidates(rows.map(mapBoardCandidate)); }
      catch { setCandidates([]); }
    })();
  }, [supabaseEnabled]);

  const filtered = useMemo(
    () =>
      (candidates || []).filter((c) => {
        if (role !== "All roles" && c.role !== role) return false;
        if (level !== "All levels" && c.level !== level) return false;
        if (loc !== "All locations" && c.location !== loc) return false;
        return true;
      }),
    [candidates, role, level, loc]
  );

  return (
    <>
      <div className="page-head">
        <h1>Candidate List</h1>
        <p>The candidate board — vetted candidates who passed AI, professional and HR interviews. Reach them directly.</p>
      </div>

      <div className="filter-bar">
        <span className="lbl"><IconFilter width={18} height={18} /> Filter</span>
        <Select value={role} onChange={setRole} options={JOB_ROLES} />
        <Select value={level} onChange={setLevel} options={LEVELS} />
        <Select value={loc} onChange={setLoc} options={LOCATIONS} />
        <button className="apply">Apply Filters</button>
      </div>

      {candidates === null ? (
        <div className="empty">Loading the candidate board…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          {candidates.length === 0
            ? "No board-ready candidates yet — they appear here once they pass the AI, Professional and HR interviews."
            : "No candidates match these filters."}
        </div>
      ) : (
        <div className="board-grid">
          {filtered.map((c) => (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <BoardCard c={c} />
              <RequestHire candidate={c} supabaseEnabled={supabaseEnabled} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function RequestHire({ candidate, supabaseEnabled }) {
  const [state, setState] = useState("idle"); // idle | done | busy
  const submit = async () => {
    const position = window.prompt(`Request to hire ${candidate.name || "this candidate"} — what role are you hiring for?`, candidate.role || "");
    if (position === null) return;
    setState("busy");
    if (supabaseEnabled) {
      try {
        const sb = getBrowserSupabase();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { alert("Please sign in as an employer/recruiter."); setState("idle"); return; }
        const { data: hr, error } = await createHireRequest(sb, user.id, candidate.id, { position, message: "" });
        if (error) { alert(error.message); setState("idle"); return; }
        reportEvent("hire_request", hr?.id);
      } catch (e) { alert(e.message); setState("idle"); return; }
    }
    setState("done");
  };
  if (state === "done") return <span className="pill-status done" style={{ alignSelf: "flex-start" }}>Hire request sent</span>;
  return (
    <button className="btn-outline" style={{ justifyContent: "center" }} disabled={state === "busy"} onClick={submit}>
      <IconBriefcase width={15} height={15} /> {state === "busy" ? "Sending…" : "Request to hire"}
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <span className="cat-select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <IconChevronDown width={16} height={16} />
    </span>
  );
}
