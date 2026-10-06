"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";
import {
  IconSearch,
  IconChevronDown,
  IconMapPin,
  IconClock,
  IconBookmark,
  IconBookmarkFilled,
} from "@/components/Icons";

// A reusable course catalog with search + filters, used by both the
// Specific and Suggested training pages.
export default function CourseCatalog({ heading, courses }) {
  const { app, toggleSaveTraining } = useAuth();
  const saved = app.savedTraining || [];
  const [q, setQ] = useState("");
  const [type, setType] = useState("All Types");
  const [form, setForm] = useState("All Forms");
  const [price, setPrice] = useState("All Prices");

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (type !== "All Types" && c.type !== type) return false;
      if (form !== "All Forms" && c.form !== form) return false;
      if (price === "Free" && c.price !== 0) return false;
      if (price === "Paid" && c.price === 0) return false;
      return true;
    });
  }, [courses, q, type, form, price]);

  return (
    <>
      <h2 className="card-title" style={{ fontSize: 20, marginBottom: 16 }}>{heading}</h2>
      <div className="cat-toolbar">
        <span className="cat-search">
          <IconSearch width={18} height={18} />
          <input placeholder="Search training suitable for you" value={q} onChange={(e) => setQ(e.target.value)} />
        </span>
        <Select value={type} onChange={setType} options={["All Types", "Frontend", "Backend", "Design", "Product", "Data"]} />
        <Select value={form} onChange={setForm} options={["All Forms", "Online", "Onsite"]} />
        <Select value={price} onChange={setPrice} options={["All Prices", "Free", "Paid"]} />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">No training matches your filters.</div>
      ) : (
        <div className="course-grid">
          {filtered.map((c) => {
            const isSaved = saved.includes(c.id);
            return (
              <div className="course-card" key={c.id}>
                <div className="cc-top">
                  <h4>{c.title}</h4>
                  <span className={`cc-badge ${c.badge.toLowerCase()}`}>{c.badge}</span>
                </div>
                <p className="cc-provider">{c.provider}</p>
                <p className="cc-desc">{c.desc}</p>
                <div className="cc-meta">
                  <span><IconMapPin /> {c.form}</span>
                  <span>{c.price === 0 ? "Free" : `$${c.price}`}</span>
                  <span><IconClock /> {c.weeks} weeks</span>
                </div>
                <div className="cc-actions">
                  <a href="#" className="start" onClick={(e) => e.preventDefault()}>
                    {c.badge === "Enrolled" ? "Continue Training" : "Start Training"}
                  </a>
                  <button className={`cc-save ${isSaved ? "on" : ""}`} onClick={() => toggleSaveTraining(c.id)}>
                    {isSaved ? <IconBookmarkFilled /> : <IconBookmark />}
                    {isSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function Select({ value, onChange, options }) {
  return (
    <span className="cat-select">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <IconChevronDown width={16} height={16} />
    </span>
  );
}
