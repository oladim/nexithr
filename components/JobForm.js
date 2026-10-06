"use client";

import { useState } from "react";
import { IconPlus, IconX } from "@/components/Icons";

// Shared job create form used by admin (post → approved) and recruiter
// (post → pending approval).
export default function JobForm({ onCancel, onSave, pending }) {
  const [f, setF] = useState({ title: "", company: "", type: "Full-time", location: "", salary: "", description: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <div className="card pad rr-new">
      <div className="rr-head">
        <h3 className="card-title" style={{ margin: 0 }}>New job{pending ? " (awaits admin approval)" : ""}</h3>
        <button className="rr-del" onClick={onCancel}><IconX width={16} height={16} /></button>
      </div>
      <div className="field-row">
        <div className="field field-simple"><label>Title</label><input value={f.title} onChange={set("title")} placeholder="e.g. Frontend Engineer" /></div>
        <div className="field field-simple"><label>Company</label><input value={f.company} onChange={set("company")} /></div>
      </div>
      <div className="field-row">
        <div className="field field-simple"><label>Type</label>
          <select value={f.type} onChange={set("type")}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option></select>
        </div>
        <div className="field field-simple"><label>Location</label><input value={f.location} onChange={set("location")} placeholder="Lagos / Remote" /></div>
        <div className="field field-simple"><label>Salary</label><input value={f.salary} onChange={set("salary")} placeholder="optional" /></div>
      </div>
      <label className="cv-step-label" style={{ marginTop: 10 }}>Description</label>
      <textarea className="cvr-textarea" rows={4} value={f.description} onChange={set("description")} />
      <div className="cvr-actions" style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn-solid" onClick={() => onSave(f)}><IconPlus width={14} height={14} /> {pending ? "Submit for approval" : "Post job"}</button>
      </div>
    </div>
  );
}
