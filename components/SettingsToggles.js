"use client";

import { useState, useEffect } from "react";

// Reusable grouped toggle settings. Optional `initial` (map keyed by "gi.ii")
// seeds saved values; optional `onChange(state)` fires on every toggle so the
// parent can persist. Used by candidate (persisted), recruiter and admin.
export default function SettingsToggles({ groups, initial, onChange }) {
  const [state, setState] = useState(() => {
    const init = {};
    groups.forEach((g, gi) => g.items.forEach((it, ii) => (init[`${gi}.${ii}`] = it.on)));
    return { ...init, ...(initial || {}) };
  });

  // If saved values arrive after mount, merge them in.
  useEffect(() => {
    if (initial) setState((s) => ({ ...s, ...initial }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial || {})]);

  const flip = (k) =>
    setState((s) => {
      const next = { ...s, [k]: !s[k] };
      onChange?.(next);
      return next;
    });

  return (
    <>
      {groups.map((g, gi) => (
        <div className="settings-group" key={g.group}>
          <h4>{g.group}</h4>
          <div className="settings-list">
            {g.items.map((it, ii) => {
              const k = `${gi}.${ii}`;
              return (
                <div className="set-row" key={it.label}>
                  <span>{it.label}</span>
                  <button
                    className={`toggle ${state[k] ? "on" : ""}`}
                    onClick={() => flip(k)}
                    aria-label={it.label}
                    aria-pressed={state[k]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
