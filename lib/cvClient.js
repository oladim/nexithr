// Quick checks in the browser before uploading a CV. The server re-checks the
// actual file contents (lib/fileSafety.js) — this just gives instant feedback.
export function cvFileProblem(f) {
  const ext = (String(f?.name || "").split(".").pop() || "").toLowerCase();
  if (ext === "doc") return "Old Word (.doc) files aren't accepted. Please save your CV as .docx or PDF.";
  if (!["pdf", "docx"].includes(ext)) return "Only PDF and Word (.docx) files are accepted.";
  if (f.size > 5 * 1024 * 1024) return "Your CV is larger than 5 MB. Please upload a smaller file.";
  if (f.size === 0) return "That file is empty.";
  return null;
}
