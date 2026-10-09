// Home page of each signed-in portal.
export function portalHome(role) {
  if (role === "admin") return "/admin";
  if (role === "interviewer") return "/interviewer";
  if (role === "recruiter") return "/recruiter";
  return "/dashboard";
}
