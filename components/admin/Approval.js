"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck } from "@/components/Icons";

// Can the signed-in admin approve courses/modules? (super-admin, or a group
// with the "course_approval" permission). Demo mode: yes.
export function useCanApprove() {
  const { supabaseEnabled } = useAuth();
  const [can, setCan] = useState(!supabaseEnabled);
  useEffect(() => {
    if (!supabaseEnabled) return;
    fetch("/api/me/permissions", { cache: "no-store" })
      .then((r) => r.json())
      .then((a) => setCan(a?.role === "admin" && (a.superAdmin || (a.permissions || []).includes("course_approval"))))
      .catch(() => setCan(false));
  }, [supabaseEnabled]);
  return can;
}

/**
 * Status + approve/withdraw control for a course or module.
 * Approved items are what candidates see; anything else stays hidden.
 */
export function ApprovalBar({ kind, id, approved, canApprove, onChange, withModules = false, disabled = false }) {
  const { supabaseEnabled } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const act = async (next) => {
    if (next === false && !confirm(`Withdraw this ${kind}? Candidates will no longer see it.`)) return;
    setErr(""); setBusy(true);
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/admin/course-approval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, id, approved: next, includeModules: withModules }),
        });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't update"); setBusy(false); return; }
      } catch { setErr("Couldn't update"); setBusy(false); return; }
    }
    onChange?.(next);
    setBusy(false);
  };

  return (
    <div className="appr-bar">
      <span className={`appr-pill ${approved ? "ok" : "wait"}`}>
        {approved ? "Approved · visible to candidates" : "Awaiting approval · hidden from candidates"}
      </span>
      {canApprove ? (
        approved ? (
          <button type="button" className="mini-btn appr-withdraw" disabled={busy || disabled} onClick={() => act(false)}>{busy ? "Saving…" : "Withdraw"}</button>
        ) : (
          <button type="button" className="mini-btn appr-approve" disabled={busy || disabled} onClick={() => act(true)}>
            <IconCheck width={13} height={13} /> {busy ? "Approving…" : withModules ? "Approve course & its modules" : "Approve"}
          </button>
        )
      ) : (
        !approved && <span className="appr-hint">An approver must publish this.</span>
      )}
      {err && <span className="appr-err">{err}</span>}
    </div>
  );
}
