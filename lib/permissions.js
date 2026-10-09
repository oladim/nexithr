// =====================================================================
// Feature-permission catalog for the admin portal (RBAC).
//
// Admins can be placed in a GROUP; each group holds a set of permission
// keys drawn from this catalog. An admin with NO group (group_id == null)
// is a SUPER-ADMIN and implicitly holds every permission.
//
// This module is import-safe on both the client and the server (no node
// built-ins), so it can drive the admin nav, page guards and API checks
// from a single source of truth.
// =====================================================================

// key   — stored in groups.permissions[]
// label — shown in the group editor
// href  — the admin route this permission unlocks (nav + page guard)
export const PERMISSIONS = [
  { key: "cv_reviews", label: "CV Reviews", href: "/admin/cv-reviews" },
  { key: "interviews", label: "Interviews", href: "/admin/interviews" },
  { key: "ai_results", label: "AI Results", href: "/admin/ai-results" },
  { key: "role_requirements", label: "Role Requirements", href: "/admin/role-requirements" },
  { key: "specific_training", label: "Specific Training", href: "/admin/specific-training" },
  { key: "course_approval", label: "Approve courses & modules", href: null },
  { key: "course_requests", label: "Course Requests", href: "/admin/course-requests" },
  { key: "suggested_resources", label: "Suggested Resources", href: "/admin/suggested-resources" },
  { key: "jobs", label: "Job Board", href: "/admin/jobs" },
  { key: "hire_requests", label: "Hire Requests", href: "/admin/hire-requests" },
  { key: "payouts", label: "Interviewer Payouts", href: "/admin/payouts" },
  { key: "testimonials", label: "Testimonials", href: "/admin/testimonials" },
  { key: "landing", label: "Landing Page", href: "/admin/landing" },
  { key: "staff_approvals", label: "Staff Approvals", href: "/admin/staff-approvals" },
  { key: "users", label: "Users & Groups", href: "/admin/users" },
  { key: "requests", label: "Requests", href: "/admin/requests" },
  { key: "notifications", label: "Notifications", href: "/admin/notifications" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

export const PERMISSION_KEYS = PERMISSIONS.map((p) => p.key);

// The admin dashboard (/admin) is always available to any admin.
export const ALWAYS_ALLOWED = ["/admin"];

// Does this access descriptor grant `key`?
//   access = { superAdmin: boolean, permissions: string[] }
export function hasPerm(access, key) {
  if (!access) return false;
  if (access.superAdmin) return true;
  return Array.isArray(access.permissions) && access.permissions.includes(key);
}

// Map a pathname to the permission key that guards it (longest prefix wins),
// or null when the path isn't permission-gated (e.g. the dashboard).
export function permForPath(pathname) {
  if (!pathname) return null;
  if (ALWAYS_ALLOWED.includes(pathname)) return null;
  let best = null;
  for (const p of PERMISSIONS) {
    if (!p.href) continue; // capability-only permission (no page)
    if (pathname === p.href || pathname.startsWith(p.href + "/")) {
      if (!best || p.href.length > best.href.length) best = p;
    }
  }
  return best ? best.key : null;
}

// Can this access descriptor open the given admin path?
export function canOpenPath(access, pathname) {
  if (!access) return false;
  if (access.superAdmin) return true;
  const key = permForPath(pathname);
  if (!key) return true; // ungated (dashboard, unknown admin sub-pages)
  return hasPerm(access, key);
}
