import { IconDownload, IconChat } from "@/components/Icons";

export default function BoardCard({ c }) {
  return (
    <div className="board-card">
      <div className="bc-head">
        <span className="bc-av" style={{ background: c.color }}>
          {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <div>
          <h4>{c.name}</h4>
          <p>{c.role}</p>
        </div>
      </div>
      <div className="bc-meta">
        <span><b>{c.exp}</b> exp</span>
        <span>{c.level}</span>
        <span>{c.location}</span>
      </div>
      <div className="bc-skills">
        {c.skills.map((s) => <span key={s}>{s}</span>)}
      </div>
      <div className="bc-rate">
        {"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}
        <span className="st">{c.status}</span>
      </div>
      <div className="bc-actions">
        <button className="b1"><IconChat width={14} height={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />Message</button>
        <button className="b2"><IconDownload width={14} height={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />CV</button>
      </div>
    </div>
  );
}
