"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { IconSearch, IconBell, IconChevronDown, IconUser, IconGear, IconLock, IconLogout, IconChevronRight } from "@/components/Icons";

// Demo-mode notifications so the panel is never empty without a backend.
const DEMO_NOTES = [
  { id: "d1", title: "Welcome to NexIT-Africa", body: "Upload your CV to unlock the AI interview.", read: false, created_at: new Date().toISOString() },
  { id: "d2", title: "Two-factor authentication", body: "Protect your account with Google Authenticator.", read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

function ago(iso) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * Top-bar actions shared by every portal: search (jump to any page — also
 * opens with Ctrl/⌘+K or "/"), a notifications panel with an unread badge,
 * and an account menu. Each control looks clickable, says what it does
 * (tooltip + aria-label) and gives immediate feedback when used.
 *
 * props:
 *   nav               — [{ href, label }] pages the search can jump to
 *   profileHref       — account "Profile" link (optional)
 *   settingsHref      — account "Settings" link (optional)
 *   notificationsHref — "View all" link in the notifications panel (optional)
 */
export default function TopbarActions({ nav = [], profileHref, settingsHref, notificationsHref }) {
  const router = useRouter();
  const { user, logout, supabaseEnabled } = useAuth();
  const [open, setOpen] = useState(null); // "notes" | "account" | null
  const [searchOpen, setSearchOpen] = useState(false);
  const [notes, setNotes] = useState(supabaseEnabled ? null : DEMO_NOTES);
  const wrapRef = useRef(null);

  const initials = (user?.name || "U").split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const unread = (notes || []).filter((n) => !n.read).length;

  // ---- notifications ----
  const loadNotes = useCallback(async () => {
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    if (!sb) { setNotes([]); return; }
    try {
      const { data: { user: au } } = await sb.auth.getUser();
      if (!au) { setNotes([]); return; }
      const { data } = await sb.from("notifications").select("id, title, body, read, created_at").eq("user_id", au.id).order("created_at", { ascending: false }).limit(12);
      setNotes(data || []);
    } catch { setNotes([]); }
  }, [supabaseEnabled]);
  useEffect(() => {
    loadNotes();
    if (!supabaseEnabled) return;
    const t = setInterval(loadNotes, 60000); // keep the badge fresh
    return () => clearInterval(t);
  }, [loadNotes, supabaseEnabled]);

  const markAllRead = async () => {
    setNotes((list) => (list || []).map((n) => ({ ...n, read: true })));
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    try {
      const { data: { user: au } } = await sb.auth.getUser();
      if (au) await sb.from("notifications").update({ read: true }).eq("user_id", au.id).eq("read", false);
    } catch { /* optimistic */ }
  };

  // ---- close menus on outside click / Escape; search shortcuts ----
  useEffect(() => {
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null); };
    const onKey = (e) => {
      const typing = /input|textarea|select/i.test(e.target?.tagName || "") || e.target?.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); setSearchOpen(true); setOpen(null); }
      if (e.key === "Escape") { setOpen(null); setSearchOpen(false); }
    };
    const onOpen = () => { setSearchOpen(true); setOpen(null); };
    window.addEventListener("nexit:open-search", onOpen);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("nexit:open-search", onOpen); document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const toggle = (which) => {
    setOpen((cur) => (cur === which ? null : which));
    if (which === "notes") loadNotes();
  };

  const doLogout = () => { setOpen(null); logout(); router.replace("/login"); };

  return (
    <div className="acts" ref={wrapRef}>
      <button type="button" className="icon-btn" onClick={() => { setSearchOpen(true); setOpen(null); }} aria-label="Search pages (Ctrl+K)" title="Search pages (Ctrl+K)">
        <IconSearch />
      </button>

      <div className="tb-pop-wrap">
        <button
          type="button"
          className={`icon-btn ${open === "notes" ? "is-open" : ""}`}
          onClick={() => toggle("notes")}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          aria-haspopup="true"
          aria-expanded={open === "notes"}
          title="Notifications"
        >
          <IconBell />
          {unread > 0 && <span className="tb-badge" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
        </button>
        {open === "notes" && (
          <div className="tb-pop tb-notes" role="dialog" aria-label="Notifications">
            <div className="tb-pop-head">
              <b>Notifications</b>
              {unread > 0 && <button type="button" className="tb-link" onClick={markAllRead}>Mark all as read</button>}
            </div>
            <div className="tb-notes-list">
              {notes === null ? (
                <p className="tb-empty">Loading…</p>
              ) : notes.length === 0 ? (
                <p className="tb-empty">You&apos;re all caught up — no notifications yet.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className={`tb-note ${n.read ? "" : "unread"}`}>
                    <span className="dot" aria-hidden="true" />
                    <div>
                      <div className="t">{n.title}</div>
                      {n.body && <div className="b">{n.body}</div>}
                      <div className="w">{ago(n.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notificationsHref && (
              <Link href={notificationsHref} className="tb-pop-foot" onClick={() => setOpen(null)}>View all notifications <IconChevronRight width={14} height={14} /></Link>
            )}
          </div>
        )}
      </div>

      <div className="tb-pop-wrap">
        <button
          type="button"
          className={`avatar ${open === "account" ? "is-open" : ""}`}
          onClick={() => toggle("account")}
          aria-haspopup="menu"
          aria-expanded={open === "account"}
          title="Account menu"
        >
          <span className="pic">{initials}</span>
          <span className="nm2">{user?.name}</span>
          <IconChevronDown width={16} height={16} className="chev" />
        </button>
        {open === "account" && (
          <div className="tb-pop tb-menu" role="menu">
            <div className="tb-menu-head">
              <span className="pic">{initials}</span>
              <div style={{ minWidth: 0 }}>
                <b>{user?.name}</b>
                <span>{user?.email}</span>
              </div>
            </div>
            {profileHref && <Link role="menuitem" href={profileHref} onClick={() => setOpen(null)}><IconUser width={16} height={16} /> My profile</Link>}
            {settingsHref && <Link role="menuitem" href={settingsHref} onClick={() => setOpen(null)}><IconGear width={16} height={16} /> Settings</Link>}
            <Link role="menuitem" href="/account/security" onClick={() => setOpen(null)}><IconLock width={16} height={16} /> Security &amp; 2FA</Link>
            <button role="menuitem" type="button" className="danger" onClick={doLogout}><IconLogout width={16} height={16} /> Log out</button>
          </div>
        )}
      </div>

      {searchOpen && <SearchPalette nav={nav} onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

// Quick "jump to page" palette.
function SearchPalette({ nav, onClose }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const items = useMemo(() => {
    const all = [...nav, { href: "/account/security", label: "Security & 2FA" }];
    const s = q.trim().toLowerCase();
    return s ? all.filter((n) => n.label.toLowerCase().includes(s)) : all;
  }, [nav, q]);
  useEffect(() => setI(0), [q]);

  const go = (it) => { if (!it) return; onClose(); router.push(it.href); };

  return (
    <div className="tb-search-scrim" onMouseDown={onClose}>
      <div className="tb-search" role="dialog" aria-label="Search pages" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tb-search-in">
          <IconSearch width={18} height={18} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages…"
            aria-label="Search pages"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              if (e.key === "Enter") { e.preventDefault(); go(items[i]); }
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="tb-search-list">
          {items.length === 0 ? (
            <p className="tb-empty">No page matches “{q}”.</p>
          ) : (
            items.map((it, k) => (
              <button key={it.href} type="button" className={k === i ? "sel" : ""} onMouseEnter={() => setI(k)} onClick={() => go(it)}>
                <span>{it.label}</span>
                <IconChevronRight width={14} height={14} />
              </button>
            ))
          )}
        </div>
        <div className="tb-search-foot"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Ctrl</kbd>+<kbd>K</kbd> anywhere</div>
      </div>
    </div>
  );
}
