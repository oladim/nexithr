"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { USER_GROUPS } from "@/components/admin/data";
import { PERMISSIONS } from "@/lib/permissions";
import { IconPlus, IconCheck, IconX, IconPeople } from "@/components/Icons";

const ROLES = ["candidate", "interviewer", "recruiter", "admin"];
const ROLE_COLOR = { candidate: "#007bff", interviewer: "#8b5cf6", recruiter: "#0ea5e9", admin: "#111827" };
const initials = (n) => (n || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function AdminUsers() {
  const { supabaseEnabled } = useAuth();

  // Demo mode: keep the original read-only card view.
  if (!supabaseEnabled) {
    return (
      <>
        <div className="page-head">
          <h1>Users &amp; Groups</h1>
          <p>Connect Supabase (real mode) to create users, assign groups and manage feature permissions.</p>
        </div>
        {USER_GROUPS.map((g) => (
          <div key={g.group}>
            <h3 className="group-title">{g.group}</h3>
            <div className="user-cards">
              {g.users.map((u) => (
                <div className="user-card" key={u.name}>
                  <span className="uc-av" style={{ background: u.color }}>{initials(u.name)}</span>
                  <h5>{u.name}</h5>
                  <p>{u.role}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }

  return <Manage />;
}

function Manage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(null);
  const [groups, setGroups] = useState([]);
  const [meId, setMeId] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users);
      setGroups(data.groups || []);
      setMeId(data.meId);
      setSuperAdmin(!!data.superAdmin);
    } catch (e) { setErr(e.message); setUsers([]); }
  };
  useEffect(() => { load(); }, []);

  const groupName = (id) => groups.find((g) => g.id === id)?.name || "—";

  return (
    <>
      <div className="page-head">
        <h1>Users &amp; Groups</h1>
        <p>Create users, grant platform roles, and control which admin features each group can access.</p>
      </div>

      <div className="train-tabs" style={{ marginBottom: 18 }}>
        <button className={`train-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")} style={{ border: "none", background: "none", cursor: "pointer" }}>Users</button>
        <button className={`train-tab ${tab === "groups" ? "active" : ""}`} onClick={() => setTab("groups")} style={{ border: "none", background: "none", cursor: "pointer" }}>Groups &amp; permissions</button>
      </div>

      {msg && <div className="role-note ok">{msg}</div>}
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      {tab === "users"
        ? <UsersTab users={users} groups={groups} meId={meId} superAdmin={superAdmin} groupName={groupName} reload={load} setMsg={setMsg} setErr={setErr} />
        : <GroupsTab groups={groups} superAdmin={superAdmin} reload={load} setMsg={setMsg} setErr={setErr} />}
    </>
  );
}

// ---------------------------------------------------------------- Users tab
function UsersTab({ users, groups, meId, superAdmin, groupName, reload, setMsg, setErr }) {
  const [busyId, setBusyId] = useState(null);
  const [adding, setAdding] = useState(false);

  const changeRole = async (u, role) => {
    if (role === u.role) return;
    setBusyId(u.id); setMsg(""); setErr("");
    try {
      const res = await fetch("/api/admin/set-role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: u.email, role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(data.message || `${u.email} is now ${role}`);
      await reload();
    } catch (e) { setErr(e.message); } finally { setBusyId(null); }
  };

  const changeGroup = async (u, groupId) => {
    setBusyId(u.id); setMsg(""); setErr("");
    try {
      const res = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, groupId: groupId || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`${u.email} group updated.`);
      await reload();
    } catch (e) { setErr(e.message); } finally { setBusyId(null); }
  };

  return (
    <>
      <div className="rr-top">
        <span className="cvr-count">{(users || []).length} users</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> Create user</button>}
      </div>

      {adding && <CreateUserForm groups={groups} superAdmin={superAdmin} onCancel={() => setAdding(false)} onDone={async (m) => { setAdding(false); setMsg(m); await reload(); }} setErr={setErr} />}

      <div className="card pad" style={{ marginTop: 14 }}>
        {users === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading users…</p>
          : users.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 14 }}>No users yet.</p>
          : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Group (admins)</th><th>2FA</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <span className="uc-av" style={{ width: 30, height: 30, fontSize: 12, margin: 0, background: ROLE_COLOR[u.role] || "#64748b" }}>{initials(u.full_name)}</span>
                      {u.full_name || "—"}{u.id === meId && <span className="you-tag">you</span>}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select className="role-select" value={u.role} disabled={busyId === u.id || u.id === meId} onChange={(e) => changeRole(u, e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r} disabled={r === "admin" && !superAdmin}>{r}</option>)}
                    </select>
                  </td>
                  <td>
                    {u.role === "admin" ? (
                      <select className="role-select" value={u.group_id || ""} disabled={busyId === u.id || (u.id === meId && !superAdmin)} onChange={(e) => changeGroup(u, e.target.value)}>
                        <option value="">Super-admin (all)</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    ) : <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>}
                  </td>
                  <td>{u.totp_enabled ? <span className="role-note ok" style={{ padding: "2px 8px", display: "inline-block" }}>On</span> : <span style={{ color: "var(--muted)", fontSize: 13 }}>Off</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, maxWidth: 680 }}>
        An admin with <b>no group</b> is a super-admin and can access every feature. Assign a group to limit an admin to that group&apos;s permissions.
        Public signups can only ever become candidates, and you can&apos;t change your own admin role or group (a safeguard against locking yourself out).
      </p>
    </>
  );
}

function CreateUserForm({ groups, superAdmin, onCancel, onDone, setErr }) {
  const [f, setF] = useState({ fullName: "", email: "", password: "", role: "candidate", groupId: "", interviewerKind: "Professional", orgName: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");
      onDone(data.message || "User created.");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card pad rr-new">
      <div className="rr-head"><h3 className="card-title" style={{ margin: 0 }}>Create user</h3><button className="rr-del" onClick={onCancel}><IconX width={16} height={16} /></button></div>
      <div className="field-row" style={{ marginTop: 6 }}>
        <div className="field field-simple"><label>Full name</label><input value={f.fullName} onChange={set("fullName")} placeholder="Jane Doe" /></div>
        <div className="field field-simple"><label>Email</label><input type="email" value={f.email} onChange={set("email")} placeholder="jane@company.com" /></div>
      </div>
      <div className="field-row" style={{ marginTop: 10 }}>
        <div className="field field-simple"><label>Temporary password</label><input value={f.password} onChange={set("password")} placeholder="At least 8 characters" /></div>
        <div className="field field-simple"><label>Role</label>
          <select value={f.role} onChange={set("role")}>{ROLES.map((r) => <option key={r} value={r} disabled={r === "admin" && !superAdmin}>{r}</option>)}</select>
        </div>
      </div>
      {f.role === "admin" && (
        <div className="field field-simple" style={{ marginTop: 10 }}><label>Group</label>
          <select value={f.groupId} onChange={set("groupId")}>
            <option value="">Super-admin (all permissions)</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}
      {f.role === "interviewer" && (
        <div className="field field-simple" style={{ marginTop: 10 }}><label>Interviewer kind</label>
          <select value={f.interviewerKind} onChange={set("interviewerKind")}><option>Professional</option><option>HR</option></select>
        </div>
      )}
      {f.role === "recruiter" && (
        <div className="field field-simple" style={{ marginTop: 10 }}><label>Organisation</label><input value={f.orgName} onChange={set("orgName")} placeholder="Company name" /></div>
      )}
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
        The account is created with its email pre-confirmed and (for staff) auto-approved. The user signs in with the temporary password, is required to set up 2FA, and can change their password from Settings.
      </p>
      <div className="cvr-actions" style={{ marginTop: 12 }}>
        <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn-solid" onClick={submit} disabled={busy}><IconPlus width={14} height={14} /> {busy ? "Creating…" : "Create user"}</button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------- Groups tab
function GroupsTab({ groups, superAdmin, reload, setMsg, setErr }) {
  const [adding, setAdding] = useState(false);

  if (!superAdmin && groups.length === 0) {
    return <div className="card pad"><p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>No groups yet.</p></div>;
  }

  return (
    <>
      <div className="rr-top">
        <span className="cvr-count">{groups.length} groups</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> New group</button>}
      </div>
      {adding && <GroupForm onCancel={() => setAdding(false)} onDone={async (m) => { setAdding(false); setMsg(m); await reload(); }} setErr={setErr} />}
      <div className="rr-grid" style={{ marginTop: 14 }}>
        {groups.map((g) => <GroupCard key={g.id} group={g} reload={reload} setMsg={setMsg} setErr={setErr} />)}
      </div>
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, maxWidth: 680 }}>
        A group&apos;s permissions decide which admin menu items and pages its members can open. Assign admins to a group from the Users tab.
      </p>
    </>
  );
}

function PermissionGrid({ selected, onToggle }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, marginTop: 8 }}>
      {PERMISSIONS.map((p) => (
        <label key={p.key} className="check-row" style={{ fontSize: 13 }}>
          <input type="checkbox" checked={selected.includes(p.key)} onChange={() => onToggle(p.key)} />
          {p.label}
        </label>
      ))}
    </div>
  );
}

function GroupForm({ onCancel, onDone, setErr }) {
  const [f, setF] = useState({ name: "", description: "", permissions: [] });
  const [busy, setBusy] = useState(false);
  const toggle = (k) => setF((p) => ({ ...p, permissions: p.permissions.includes(k) ? p.permissions.filter((x) => x !== k) : [...p.permissions, k] }));

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const res = await fetch("/api/admin/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(`Group "${f.name}" created.`);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="card pad rr-new">
      <div className="rr-head"><h3 className="card-title" style={{ margin: 0 }}>New group</h3><button className="rr-del" onClick={onCancel}><IconX width={16} height={16} /></button></div>
      <label className="cv-step-label">Name</label>
      <input className="rr-title-input full" value={f.name} onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Content Team" />
      <label className="cv-step-label" style={{ marginTop: 10 }}>Description</label>
      <textarea className="cvr-textarea" rows={2} value={f.description} onChange={(e) => setF((p) => ({ ...p, description: e.target.value }))} />
      <label className="cv-step-label" style={{ marginTop: 10 }}>Permissions</label>
      <PermissionGrid selected={f.permissions} onToggle={toggle} />
      <div className="cvr-actions" style={{ marginTop: 14 }}>
        <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn-solid" onClick={submit} disabled={busy}><IconPlus width={14} height={14} /> {busy ? "Creating…" : "Create group"}</button>
      </div>
    </div>
  );
}

function GroupCard({ group, reload, setMsg, setErr }) {
  const [perms, setPerms] = useState(group.permissions || []);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [busy, setBusy] = useState(false);
  const toggle = (k) => setPerms((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);

  const save = async () => {
    setBusy(true); setErr(""); setMsg("");
    try {
      const res = await fetch("/api/admin/groups", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: group.id, name, description, permissions: perms }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Group "${name}" saved.`);
      await reload();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm(`Delete group "${group.name}"? Its admins become super-admins.`)) return;
    setBusy(true); setErr(""); setMsg("");
    try {
      const res = await fetch(`/api/admin/groups?id=${group.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Group "${group.name}" deleted.`);
      await reload();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="card pad rr-card">
      <div className="rr-head">
        <input className="rr-title-input" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="rr-del" onClick={remove} disabled={busy}><IconX width={16} height={16} /></button>
      </div>
      <span className="cvr-count" style={{ fontSize: 12 }}>{group.memberCount || 0} member{group.memberCount === 1 ? "" : "s"}</span>
      <label className="cv-step-label" style={{ marginTop: 8 }}>Description</label>
      <textarea className="cvr-textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="cv-step-label" style={{ marginTop: 10 }}>Permissions</label>
      <PermissionGrid selected={perms} onToggle={toggle} />
      <button className="btn-solid" style={{ marginTop: 12 }} disabled={busy} onClick={save}><IconCheck width={14} height={14} /> Save</button>
    </div>
  );
}
