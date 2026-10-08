"use client";

import { useEffect, useState } from "react";

// Graduate outcomes / testimonials, admin-curated. Renders nothing when empty.
export default function Testimonials({ heading = "Graduate outcomes" }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await (await fetch("/api/testimonials")).json();
        setRows(Array.isArray(data.testimonials) ? data.testimonials : []);
      } catch { setRows([]); }
    })();
  }, []);
  if (rows.length === 0) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <h3 className="card-title">{heading}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(260px, 100%),1fr))", gap: 14 }}>
        {rows.map((t) => (
          <div className="card pad" key={t.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{t.quote}&rdquo;</p>
            <div style={{ marginTop: "auto" }}>
              <b style={{ fontSize: 14 }}>{t.name}</b>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{[t.role, t.company].filter(Boolean).join(" · ")}</div>
              {t.outcome && <span className="pill-status done" style={{ marginTop: 6, display: "inline-block" }}>{t.outcome}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
