// Server helper: does this candidate have training access that covers a
// course's role_key? Access is bought per target role ("support-sysadmin-mid");
// courses can belong to the role ("support-sysadmin") or to that exact level.
import { courseKeysFor } from "./roleCatalog";

export async function hasCourseAccess(admin, candidateId, courseRoleKey) {
  const { data } = await admin.from("training_access").select("role_key").eq("candidate_id", candidateId);
  return (data || []).some((a) => courseKeysFor(a.role_key).includes(courseRoleKey));
}
