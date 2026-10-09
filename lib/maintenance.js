// Maintenance mode helpers — safe to import on the client and the server.
//
// status:
//   "off"       — maintenance switched off
//   "scheduled" — switched on, but the start time is still in the future:
//                 users see a heads-up banner and can keep working
//   "active"    — switched on and started (or no start set): every portal
//                 except Admin is locked until an admin switches it off.
//                 The end time is an estimate shown to users, not a timer.

export const DEMO_MAINTENANCE_KEY = "nexit.maintenance.demo";

export function maintenanceStatus(m, now = Date.now()) {
  if (!m || !m.enabled) return "off";
  if (m.start && new Date(m.start).getTime() > now) return "scheduled";
  return "active";
}

// From an app_settings row (snake_case) to the public shape.
export function maintenanceFromSettings(s) {
  return {
    enabled: !!s?.maintenance_enabled,
    start: s?.maintenance_start || null,
    end: s?.maintenance_end || null,
    message: s?.maintenance_message || "",
  };
}

// Server-side messages use Lagos time (WAT) since servers run in UTC;
// in the browser the viewer's own time zone is used.
export const SERVER_TZ = "Africa/Lagos";
export function fmtWhen(iso, timeZone) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const s = d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", ...(timeZone ? { timeZone } : {}) });
  return timeZone === SERVER_TZ ? `${s} WAT` : s;
}

// "Sat 12 Oct 2026, 22:00 – Sun 13 Oct 2026, 02:00"
export function fmtWindow(m, timeZone) {
  const a = fmtWhen(m?.start, timeZone);
  const b = fmtWhen(m?.end, timeZone);
  if (a && b) return `${a} – ${b}`;
  if (a) return `from ${a}`;
  if (b) return `until about ${b}`;
  return "";
}

// ISO → value for <input type="datetime-local"> in the viewer's time zone.
export function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function fromLocalInput(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Demo mode keeps maintenance in this browser's localStorage.
export function readDemoMaintenance() {
  try { return JSON.parse(localStorage.getItem(DEMO_MAINTENANCE_KEY) || "null"); } catch { return null; }
}
export function writeDemoMaintenance(m) {
  try { localStorage.setItem(DEMO_MAINTENANCE_KEY, JSON.stringify(m)); } catch { /* private mode */ }
  try { window.dispatchEvent(new Event("nexit:maintenance")); } catch { /* ssr */ }
}
