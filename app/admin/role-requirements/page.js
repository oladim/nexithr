"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadRoleRequirements, saveRoleRequirement, createRoleRequirement, deleteRoleRequirement } from "@/lib/db";
import { AREAS as CAT_AREAS, ROLES as CAT_ROLES, LEVELS } from "@/lib/roleCatalog";
import { AREA_ICONS } from "@/components/RolePicker";
import { IconCheck, IconPlus, IconX, IconChevronDown, IconBriefcase } from "@/components/Icons";

const lines = (v) => (Array.isArray(v) ? v : String(v || "").split("\n")).map((s) => s.trim()).filter(Boolean);
const csv = (v) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => s.trim()).filter(Boolean);
const LEVEL_LABEL = Object.fromEntries(LEVELS.map((l) => [l.key, l.label]));
const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z]+/g, "").slice(0, 16) || "role";

// Demo mode: build rows from the light catalog.
const DEMO_ROWS = CAT_ROLES.map((r) => ({
  role_key: r.key, title: r.title, kind: "role", area_key: r.area, base_role: r.base, base_title: r.baseTitle, level: r.level,
  description: `${r.summary}\n\nAt this level: ${r.focus}`, focus: r.focus, required_skills: [], responsibilities: [], tools: [], certifications: [],
  min_experience: r.minYears, enabled: true, sort: r.sort,
}));

export default function RoleRequirements() {
  const { supabaseEnabled } = useAuth();
  const sb = () => getBrowserSupabase();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO_ROWS);
  const [areas, setAreas] = useState(CAT_AREAS);
  const [area, setArea] = useState("support");
  const [openBase, setOpenBase] = useState(null);
  const [editing, setEditing] = useState(null); // role_key
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [waitlist, setWaitlist] = useState(null);

  const flash = (m) => { setNote(m); setTimeout(() => setNote(""), 6000); };

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const { list } = await loadRoleRequirements(sb());
      setRows(list);
      try { const { data } = await sb().from("role_areas").select("*").order("sort"); if (data?.length) setAreas(data); } catch { /* pre-0029 */ }
      try { const r = await fetch("/api/admin/roles", { cache: "no-store" }); if (r.ok) setWaitlist(await r.json()); } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseEnabled]);

  const announce = async (roleKey, title) => {
    if (!supabaseEnabled) return;
    try {
      const res = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roleKey }) });
      const d = await res.json();
      if (res.ok && d.notified > 0) flash(`${title} is open — ${d.notified} waitlisted candidate${d.notified === 1 ? "" : "s"} notified.`);
    } catch { /* best effort */ }
  };

  // ---- grouping ----
  const catalogRows = (rows || []).filter((r) => r.kind !== "area" && r.area_key && r.level);
  const otherRows = (rows || []).filter((r) => !(r.kind !== "area" && r.area_key && r.level));
  const tabs = [...areas.map((a) => ({ key: a.key, title: a.title })), ...(otherRows.length ? [{ key: "__other", title: "Other & legacy" }] : [])];
  const bases = useMemo(() => {
    const m = new Map();
    catalogRows.filter((r) => r.area_key === area).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)).forEach((r) => {
      if (!m.has(r.base_role)) m.set(r.base_role, { key: r.base_role, title: r.base_title || r.title, rows: [] });
      m.get(r.base_role).rows.push(r);
    });
    return [...m.values()];
  }, [catalogRows, area]);
  const countOpen = (list) => list.filter((r) => r.enabled !== false).length;

  // ---- writes ----
  const setEnabled = async (list, enabled) => {
    setErr(""); setBusy("toggle");
    for (const r of list) {
      if (supabaseEnabled) {
        const { error } = await saveRoleRequirement(sb(), r.role_key, { enabled });
        if (error) { setErr(error.message); break; }
      }
      if (enabled && r.enabled === false) announce(r.role_key, r.title);
    }
    const keys = new Set(list.map((r) => r.role_key));
    setRows((rs) => rs.map((r) => (keys.has(r.role_key) ? { ...r, enabled } : r)));
    setBusy("");
  };

  const saveRow = async (r, playbook) => {
    setErr(""); setBusy(r.role_key);
    const payload = {
      title: r.title, description: r.description || null, focus: r.focus || null,
      required_skills: csv(r.required_skills), responsibilities: lines(r.responsibilities), tools: csv(r.tools), certifications: lines(r.certifications),
      min_experience: Number(r.min_experience) || 0, enabled: r.enabled !== false,
      training_amount: r.training_amount === "" || r.training_amount == null ? null : Number(r.training_amount),
    };
    if (supabaseEnabled) {
      const { error } = await saveRoleRequirement(sb(), r.role_key, payload);
      if (error) { setErr(error.message); setBusy(""); return false; }
      if (playbook) {
        const { error: e2 } = await sb().from("role_playbooks").upsert({ role_key: r.role_key, ...playbook, updated_at: new Date().toISOString() }, { onConflict: "role_key" });
        if (e2) { setErr(e2.message); setBusy(""); return false; }
      }
    }
    const prev = rows.find((x) => x.role_key === r.role_key);
    if (payload.enabled && prev?.enabled === false) announce(r.role_key, payload.title);
    setRows((rs) => rs.map((x) => (x.role_key === r.role_key ? { ...x, ...payload } : x)));
    setBusy(""); flash(`${payload.title} saved.`);
    return true;
  };

  const remove = async (r) => {
    if (!confirm(`Delete "${r.title}"? Candidates who chose it keep it on their profile, but nobody new can pick it. This can't be undone.`)) return;
    setBusy(r.role_key);
    if (supabaseEnabled) {
      const { error } = await deleteRoleRequirement(sb(), r.role_key);
      if (error) { setErr(error.message); setBusy(""); return; }
    }
    setRows((rs) => rs.filter((x) => x.role_key !== r.role_key));
    setEditing(null); setBusy("");
  };

  const create = async (d) => {
    setErr("");
    const title = d.title.trim();
    if (!title) { setErr("Give the role a title."); return; }
    const areaKey = d.area;
    const base = `${areaKey}-${slug(title)}`;
    const existing = new Set((rows || []).map((r) => r.role_key));
    const levels = LEVELS.filter((l) => d.levels.includes(l.key));
    if (!levels.length) { setErr("Pick at least one level."); return; }
    const created = [];
    setBusy("__new__");
    for (const L of levels) {
      const key = `${base}-${L.key}`;
      if (existing.has(key)) { setErr(`${title} (${L.label}) already exists.`); continue; }
      const row = {
        role_key: key, title: `${title} (${L.label})`, kind: "role", area_key: areaKey, base_role: base, base_title: title, level: L.key,
        description: d.summary || null, required_skills: csv(d.skills), min_experience: L.key === "junior" ? 0 : L.key === "mid" ? 2 : 5,
        enabled: false, sort: 9000 + created.length,
      };
      if (supabaseEnabled) {
        const { error } = await createRoleRequirement(sb(), row);
        if (error) { setErr(error.message); break; }
      }
      created.push(row);
    }
    setRows((rs) => [...rs, ...created]);
    setBusy(""); setAdding(false);
    if (created.length) { setArea(areaKey); setOpenBase(base); flash(`${title} added (closed) — fill in the details and interview guide, then open it.`); }
  };

  const editingRow = editing ? (rows || []).find((r) => r.role_key === editing) : null;

  return (
    <>
      <div className="page-head">
        <h1>Role Requirements</h1>
        <p>Every target role by area and level — what it requires, how candidates are interviewed for it, and whether it&apos;s open for applications.</p>
      </div>

      {err && <div className="auth-error" style={{ maxWidth: 760 }}>{err}</div>}
      {note && <div className="role-note ok">{note}</div>}

      {waitlist && waitlist.total > 0 && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <h3 className="card-title" style={{ marginBottom: 6 }}>Waitlist — {waitlist.total} candidate{waitlist.total === 1 ? "" : "s"} waiting for a position</h3>
          <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 10px" }}>They registered for a role that isn&apos;t open yet and are notified automatically when you open one.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {waitlist.interests.map((i) => <span key={i.role} className="cvr-skill have">{i.role} · {i.count}</span>)}
          </div>
        </div>
      )}

      <div className="rr2-tabs" role="tablist" aria-label="Areas">
        {tabs.map((t) => {
          const list = t.key === "__other" ? otherRows : catalogRows.filter((r) => r.area_key === t.key);
          const Icon = AREA_ICONS[t.key] || IconBriefcase;
          return (
            <button key={t.key} role="tab" aria-selected={area === t.key} className={area === t.key ? "on" : ""} onClick={() => { setArea(t.key); setOpenBase(null); }}>
              <Icon width={16} height={16} /> {t.title} <small>{countOpen(list)}/{list.length} open</small>
            </button>
          );
        })}
      </div>

      {rows === null ? <p className="rp-muted">Loading…</p> : area === "__other" ? (
        <div className="card pad">
          <p className="rr2-muted" style={{ marginTop: 0 }}>The original one-per-area roles and any custom roles without an area. Candidates who chose these keep them; they&apos;re hidden from new sign-ups once the catalog is in place.</p>
          {otherRows.map((r) => (
            <div className="rr2-level" key={r.role_key}>
              <div className="rr2-lv-main"><b>{r.title}</b><span>{r.role_key}</span></div>
              <button className="btn-outline" onClick={() => setEditing(r.role_key)}>Edit</button>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="rr2-bar">
            <span className="rr2-muted">{areas.find((a) => a.key === area)?.summary}</span>
            <div className="rr2-bar-btns">
              <button className="btn-outline" disabled={!!busy} onClick={() => setEnabled(catalogRows.filter((r) => r.area_key === area), true)}>Open all</button>
              <button className="btn-outline" disabled={!!busy} onClick={() => setEnabled(catalogRows.filter((r) => r.area_key === area), false)}>Close all</button>
              {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={15} height={15} /> Add role</button>}
            </div>
          </div>

          {adding && <NewRoleForm areas={areas} area={area} busy={busy === "__new__"} onCancel={() => setAdding(false)} onCreate={create} />}

          <div className="rr2-list">
            {bases.map((b) => {
              const open = openBase === b.key;
              return (
                <div className={`card rr2-role ${open ? "open" : ""}`} key={b.key}>
                  <button className="rr2-role-head" aria-expanded={open} onClick={() => setOpenBase(open ? null : b.key)}>
                    <div>
                      <b>{b.title}</b>
                      <span>{(b.rows[0]?.description || "").split("\n")[0]}</span>
                    </div>
                    <span className={`rr2-pill ${countOpen(b.rows) ? "on" : ""}`}>{countOpen(b.rows)}/{b.rows.length} levels open</span>
                    <IconChevronDown width={18} height={18} className="rr2-chev" />
                  </button>
                  {open && (
                    <div className="rr2-levels">
                      {b.rows.map((r) => (
                        <div className="rr2-level" key={r.role_key}>
                          <div className="rr2-lv-main">
                            <b>{LEVEL_LABEL[r.level] || r.level}</b>
                            <span>{r.min_experience}+ yrs{(r.required_skills || []).length ? ` · ${r.required_skills.slice(0, 4).join(", ")}${r.required_skills.length > 4 ? "…" : ""}` : ""}</span>
                          </div>
                          <label className="rr2-switch">
                            <input type="checkbox" checked={r.enabled !== false} disabled={!!busy} onChange={(e) => setEnabled([r], e.target.checked)} />
                            <span>{r.enabled !== false ? "Open" : "Closed"}</span>
                          </label>
                          <button className="btn-outline" onClick={() => setEditing(r.role_key)}>Edit</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {bases.length === 0 && <p className="rr2-muted">No roles in this area yet. Run migration 0029, or add one.</p>}
          </div>
        </>
      )}

      {editingRow && (
        <RoleEditor
          row={editingRow} supabaseEnabled={supabaseEnabled} busy={busy === editingRow.role_key}
          onClose={() => setEditing(null)} onSave={saveRow} onDelete={remove}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
function RoleEditor({ row, supabaseEnabled, busy, onClose, onSave, onDelete }) {
  const [tab, setTab] = useState("req");
  const [r, setR] = useState(() => ({
    ...row,
    required_skills: (row.required_skills || []).join(", "),
    tools: (row.tools || []).join(", "),
    responsibilities: (row.responsibilities || []).join("\n"),
    certifications: (row.certifications || []).join("\n"),
  }));
  const [pb, setPb] = useState(null); // playbook
  const [pbState, setPbState] = useState(supabaseEnabled ? "loading" : "demo");
  const set = (k) => (e) => setR((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  useEffect(() => {
    if (!supabaseEnabled) return;
    getBrowserSupabase().from("role_playbooks").select("*").eq("role_key", row.role_key).maybeSingle()
      .then(({ data, error }) => {
        if (error) { setPbState("missing"); return; }
        setPb(data || { competencies: [], ai_blueprint: {}, professional_guide: { questions: [] }, hr_guide: { roleScenarios: [] } });
        setPbState("ready");
      });
  }, [supabaseEnabled, row.role_key]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const bp = pb?.ai_blueprint || {};
  const setBp = (k, v) => setPb((p) => ({ ...p, ai_blueprint: { ...(p.ai_blueprint || {}), [k]: v } }));
  const comps = pb?.competencies || [];
  const proQs = pb?.professional_guide?.questions || [];
  const hrQs = pb?.hr_guide?.roleScenarios || [];
  const weightSum = comps.reduce((s, c) => s + (Number(c.weight) || 0), 0);

  const save = async () => {
    const playbook = pb && pbState === "ready" ? {
      competencies: comps.map((c) => ({ ...c, weight: Number(c.weight) || 0 })),
      ai_blueprint: { ...bp, topics: lines(bp.topics), scenarios: lines(bp.scenarios) },
      professional_guide: { ...(pb.professional_guide || {}), questions: proQs.filter((q) => q.q?.trim()), competencies: comps },
      hr_guide: { ...(pb.hr_guide || {}), roleScenarios: hrQs.filter((q) => q.q?.trim()) },
    } : null;
    if (playbook && comps.length && weightSum !== 100) { if (!confirm(`Competency weights add up to ${weightSum}%, not 100%. Save anyway?`)) return; }
    const ok = await onSave(r, playbook);
    if (ok) onClose();
  };

  const TABS = [["req", "Requirements"], ["ai", "AI interview"], ["pro", "Professional guide"], ["hr", "HR guide"]];
  return (
    <div className="tb-search-scrim" onMouseDown={onClose}>
      <div className="rr2-editor" role="dialog" aria-modal="true" aria-labelledby="rr2-ed-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rr2-ed-head">
          <div>
            <h2 id="rr2-ed-title">{row.title}</h2>
            <span>{row.role_key}</span>
          </div>
          <button className="rr-del" onClick={onClose} aria-label="Close"><IconX width={18} height={18} /></button>
        </div>
        <div className="po-tabs" role="tablist" style={{ padding: "0 22px" }}>
          {TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}
        </div>

        <div className="rr2-ed-body">
          {tab === "req" && (
            <>
              <Field label="Title"><input value={r.title} onChange={set("title")} /></Field>
              <Field label="Description (shown to candidates)"><textarea rows={4} value={r.description || ""} onChange={set("description")} /></Field>
              <Field label="What this level is trusted to do"><input value={r.focus || ""} onChange={set("focus")} /></Field>
              <Field label="Required skills — used to score CVs (comma-separated)"><textarea rows={2} value={r.required_skills} onChange={set("required_skills")} /></Field>
              <Field label="Responsibilities (one per line)"><textarea rows={5} value={r.responsibilities} onChange={set("responsibilities")} /></Field>
              <div className="field-row">
                <Field label="Tools (comma-separated)"><textarea rows={3} value={r.tools} onChange={set("tools")} /></Field>
                <Field label="Certifications (one per line)"><textarea rows={3} value={r.certifications} onChange={set("certifications")} /></Field>
              </div>
              <div className="field-row">
                <Field label="Minimum experience (years)"><input type="number" min="0" value={r.min_experience ?? 0} onChange={set("min_experience")} /></Field>
                <Field label="Training price ₦ (blank = default)"><input type="number" min="0" placeholder="default" value={r.training_amount ?? ""} onChange={set("training_amount")} /></Field>
              </div>
              <label className="consent-check"><input type="checkbox" checked={r.enabled !== false} onChange={set("enabled")} /><span>Open for applications — candidates can choose this role.</span></label>
            </>
          )}

          {tab !== "req" && pbState !== "ready" && (
            <p className="rr2-muted">{pbState === "loading" ? "Loading…" : pbState === "demo" ? "Interview guides are stored in the database — connect Supabase to view and edit them." : "Run migration 0029 to add interview guides."}</p>
          )}

          {tab === "ai" && pbState === "ready" && (
            <>
              <p className="rr2-muted" style={{ marginTop: 0 }}>Private to staff. The AI interviewer uses this to tailor questions and calibrate the Technical score to this level.</p>
              <Field label="Technical areas to probe (one per line)"><textarea rows={5} value={Array.isArray(bp.topics) ? bp.topics.join("\n") : bp.topics || ""} onChange={(e) => setBp("topics", e.target.value)} /></Field>
              <Field label="Scenario prompts (one per line)"><textarea rows={4} value={Array.isArray(bp.scenarios) ? bp.scenarios.join("\n") : bp.scenarios || ""} onChange={(e) => setBp("scenarios", e.target.value)} /></Field>
              <Field label="What a ready candidate shows / red flags"><textarea rows={3} value={bp.expectations || ""} onChange={(e) => setBp("expectations", e.target.value)} /></Field>
              <div className="rr2-comps-head"><b>Technical competencies</b><span className={weightSum === 100 ? "ok" : "warn"}>Weights: {weightSum}%</span></div>
              {comps.map((c, i) => (
                <div className="rr2-comp" key={i}>
                  <input value={c.name} placeholder="Name" onChange={(e) => setPb((p) => ({ ...p, competencies: comps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))} />
                  <input type="number" min="0" max="100" value={c.weight} aria-label="Weight %" onChange={(e) => setPb((p) => ({ ...p, competencies: comps.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)) }))} />
                  <input value={c.description} placeholder="What it covers" onChange={(e) => setPb((p) => ({ ...p, competencies: comps.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) }))} />
                  <button className="rr-del" aria-label="Remove" onClick={() => setPb((p) => ({ ...p, competencies: comps.filter((_, j) => j !== i) }))}><IconX width={14} height={14} /></button>
                </div>
              ))}
              <button className="tb-link" onClick={() => setPb((p) => ({ ...p, competencies: [...comps, { name: "", weight: 0, description: "" }] }))}>+ Add competency</button>
            </>
          )}

          {tab === "pro" && pbState === "ready" && (
            <QaList intro="Questions the Professional interviewer asks at this level, with what a strong answer includes." items={proQs}
              onChange={(list) => setPb((p) => ({ ...p, professional_guide: { ...(p.professional_guide || {}), questions: list } }))} />
          )}
          {tab === "hr" && pbState === "ready" && (
            <QaList intro="Role-specific situational questions for the HR round. The standard HR questions are added automatically for every role." items={hrQs}
              onChange={(list) => setPb((p) => ({ ...p, hr_guide: { ...(p.hr_guide || {}), roleScenarios: list } }))} />
          )}
        </div>

        <div className="rr2-ed-foot">
          <button className="btn-outline danger-text" onClick={() => onDelete(row)} disabled={busy}>Delete role</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
            <button className="btn-solid" onClick={save} disabled={busy}><IconCheck width={15} height={15} /> {busy ? "Saving…" : "Save role"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QaList({ intro, items, onChange }) {
  return (
    <>
      <p className="rr2-muted" style={{ marginTop: 0 }}>{intro}</p>
      {items.map((q, i) => (
        <div className="rr2-qa" key={i}>
          <span className="rr2-qn">{i + 1}</span>
          <div>
            <textarea rows={2} placeholder="Question" value={q.q} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} />
            <textarea rows={2} placeholder="What a strong answer includes" value={q.lookFor} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, lookFor: e.target.value } : x)))} />
          </div>
          <button className="rr-del" aria-label="Remove question" onClick={() => onChange(items.filter((_, j) => j !== i))}><IconX width={14} height={14} /></button>
        </div>
      ))}
      <button className="tb-link" onClick={() => onChange([...items, { q: "", lookFor: "" }])}>+ Add question</button>
    </>
  );
}

function Field({ label, children }) {
  return <label className="rr2-field"><span>{label}</span>{children}</label>;
}

function NewRoleForm({ areas, area, busy, onCancel, onCreate }) {
  const [d, setD] = useState({ title: "", area: areas.find((a) => a.key === area) ? area : areas[0]?.key, summary: "", skills: "", levels: ["junior", "mid", "senior"] });
  const toggle = (k) => setD((x) => ({ ...x, levels: x.levels.includes(k) ? x.levels.filter((l) => l !== k) : [...x.levels, k] }));
  return (
    <div className="card pad" style={{ marginBottom: 16 }}>
      <div className="rr-head"><h3 className="card-title" style={{ margin: 0 }}>New role</h3><button className="rr-del" onClick={onCancel} aria-label="Cancel"><IconX width={16} height={16} /></button></div>
      <div className="field-row">
        <Field label="Role title"><input placeholder="e.g. QA Engineer" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="Area"><select value={d.area} onChange={(e) => setD({ ...d, area: e.target.value })}>{areas.map((a) => <option key={a.key} value={a.key}>{a.title}</option>)}</select></Field>
      </div>
      <Field label="Short description"><textarea rows={2} value={d.summary} onChange={(e) => setD({ ...d, summary: e.target.value })} /></Field>
      <Field label="Required skills (comma-separated)"><input value={d.skills} onChange={(e) => setD({ ...d, skills: e.target.value })} /></Field>
      <div className="rr2-lvpick">
        <span>Levels</span>
        {LEVELS.map((l) => <label key={l.key} className="consent-check"><input type="checkbox" checked={d.levels.includes(l.key)} onChange={() => toggle(l.key)} /><span>{l.label}</span></label>)}
      </div>
      <p className="rr2-muted">New roles start closed. Add the interview guide, then open them.</p>
      <div className="cvr-actions"><button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button><button className="btn-solid" onClick={() => onCreate(d)} disabled={busy}><IconPlus width={15} height={15} /> {busy ? "Adding…" : "Add role"}</button></div>
    </div>
  );
}
