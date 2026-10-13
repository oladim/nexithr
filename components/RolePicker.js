"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { AREAS as CAT_AREAS, ROLES as CAT_ROLES, LEVELS, baseKeyOf, levelOf, areaOf } from "@/lib/roleCatalog";
import { IconCode, IconChart, IconUser, IconBriefcase, IconLock, IconGear, IconCheck } from "@/components/Icons";

export const AREA_ICONS = { support: IconGear, software: IconCode, data: IconChart, product: IconUser, cloud: IconBriefcase, security: IconLock };

// Open roles from the server (admin-approved), or the full catalog in demo
// mode / before the server answers. Returns { areas, roles, loading }.
export function useOpenRoles() {
  const { supabaseEnabled } = useAuth();
  const [state, setState] = useState(supabaseEnabled ? { loading: true, areas: [], roles: [] } : { loading: false, areas: CAT_AREAS, roles: CAT_ROLES });
  useEffect(() => {
    if (!supabaseEnabled) return;
    let live = true;
    fetch("/api/roles", { cache: "no-store" }).then((r) => r.json()).then((j) => {
      if (!live) return;
      const roles = Array.isArray(j.roles) ? j.roles : null;
      if (roles && roles.some((r) => r.level)) {
        const used = new Set(roles.map((r) => r.area));
        const areas = (j.areas || CAT_AREAS).filter((a) => used.has(a.key));
        setState({ loading: false, areas, roles });
      } else if (roles) {
        // Pre-catalog server: one role per area.
        setState({ loading: false, areas: [], roles, legacy: true });
      } else setState({ loading: false, areas: CAT_AREAS, roles: CAT_ROLES });
    }).catch(() => live && setState({ loading: false, areas: CAT_AREAS, roles: CAT_ROLES }));
    return () => { live = false; };
  }, [supabaseEnabled]);
  return state;
}

/**
 * Area → role → level picker.
 *   value     selected role key (e.g. "support-sysadmin-mid")
 *   onChange  (key, role) — role is { key, title, … } or null
 *   variant   "cards" (sign-up) | "compact" (profile)
 *   disabled  read-only (e.g. role locked once interviews start)
 */
export default function RolePicker({ value, onChange, variant = "cards", disabled = false, data }) {
  const own = useOpenRoles();
  const { loading, areas, roles, legacy } = data || own;

  const [area, setArea] = useState(areaOf(value) || "");
  const [base, setBase] = useState(baseKeyOf(value) || "");
  useEffect(() => { if (value) { setArea(areaOf(value)); setBase(baseKeyOf(value)); } }, [value]);

  const bases = useMemo(() => {
    const m = new Map();
    roles.filter((r) => r.area === area).forEach((r) => {
      if (!m.has(r.base)) m.set(r.base, { key: r.base, title: r.baseTitle, summary: r.description || r.summary || "", levels: [] });
      m.get(r.base).levels.push(r);
    });
    return [...m.values()];
  }, [roles, area]);
  const levelsFor = (b) => (bases.find((x) => x.key === b)?.levels || []);
  const pick = (r) => onChange?.(r ? r.key : "", r || null);

  if (loading) return <p className="rp-muted">Loading open positions…</p>;

  // Older server without the catalog — simple list.
  if (legacy) {
    return (
      <div className="job-grid">
        {roles.map((r) => (
          <button type="button" key={r.key} disabled={disabled} className={`job-card ${value === r.key ? "selected" : ""}`} onClick={() => pick(r)}>
            <span className="jc-icon"><IconBriefcase width={20} height={20} /></span>
            <span><h4>{r.title}</h4><p>{r.description || "Open for applications"}</p></span>
          </button>
        ))}
      </div>
    );
  }
  if (!roles.length) return <p className="rp-muted">No positions are open right now.</p>;

  if (variant === "compact") {
    return (
      <div className="rp-compact">
        <label className="rp-field"><span>Area</span>
          <select value={area} disabled={disabled} onChange={(e) => { setArea(e.target.value); setBase(""); pick(null); }}>
            <option value="">Choose an area…</option>
            {areas.map((a) => <option key={a.key} value={a.key}>{a.title}</option>)}
          </select>
        </label>
        <label className="rp-field"><span>Role</span>
          <select value={base} disabled={disabled || !area} onChange={(e) => { setBase(e.target.value); pick(null); }}>
            <option value="">Choose a role…</option>
            {bases.map((b) => <option key={b.key} value={b.key}>{b.title}</option>)}
          </select>
        </label>
        <label className="rp-field"><span>Level</span>
          <select value={value && baseKeyOf(value) === base ? value : ""} disabled={disabled || !base} onChange={(e) => pick(levelsFor(base).find((r) => r.key === e.target.value))}>
            <option value="">Choose a level…</option>
            {levelsFor(base).map((r) => { const L = LEVELS.find((l) => l.key === r.level); return <option key={r.key} value={r.key}>{L?.label} · {L?.years}</option>; })}
          </select>
        </label>
      </div>
    );
  }

  const selBase = bases.find((b) => b.key === base);
  return (
    <div className="rp">
      <div className="rp-step"><span className="rp-n">1</span> Area</div>
      <div className="rp-areas">
        {areas.map((a) => {
          const Icon = AREA_ICONS[a.key] || IconBriefcase;
          return (
            <button type="button" key={a.key} disabled={disabled} className={`rp-area ${area === a.key ? "selected" : ""}`}
              onClick={() => { setArea(a.key); if (area !== a.key) { setBase(""); pick(null); } }} aria-pressed={area === a.key}>
              <span className="jc-icon"><Icon width={18} height={18} /></span>
              <b>{a.title}</b>
            </button>
          );
        })}
      </div>

      {area && (
        <>
          <div className="rp-step"><span className="rp-n">2</span> Role</div>
          <div className="rp-roles">
            {bases.map((b) => (
              <button type="button" key={b.key} disabled={disabled} className={`rp-role ${base === b.key ? "selected" : ""}`}
                onClick={() => { setBase(b.key); if (base !== b.key) pick(null); }} aria-pressed={base === b.key}>
                <b>{b.title}</b>
                <span>{(b.summary || "").split(". ")[0].replace(/\.$/, "")}.</span>
              </button>
            ))}
          </div>
        </>
      )}

      {selBase && (
        <>
          <div className="rp-step"><span className="rp-n">3</span> Level</div>
          <div className="rp-levels" role="radiogroup" aria-label="Experience level">
            {LEVELS.map((L) => {
              const r = selBase.levels.find((x) => x.level === L.key);
              const on = r && value === r.key;
              return (
                <button type="button" role="radio" aria-checked={!!on} key={L.key} disabled={disabled || !r}
                  className={`rp-level ${on ? "selected" : ""}`} onClick={() => r && pick(r)}
                  title={r ? "" : "Not open yet"}>
                  {on && <span className="rp-tick"><IconCheck width={12} height={12} /></span>}
                  <b>{L.label}</b>
                  <small>{L.years}</small>
                  <span>{r ? L.blurb : "Not open yet"}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
