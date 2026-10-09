// Browser helper: tell the server about an action so the team inbox can be
// emailed. Fire-and-forget — never blocks or breaks the UI.
export function reportEvent(type, id) {
  try {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
