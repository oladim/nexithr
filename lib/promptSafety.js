// Pure helper (safe for any bundle).
// ---------- prompts ----------
// Text from an uploaded file is untrusted. Strip control characters and
// anything that imitates our prompt delimiters so it can't break out of the
// "data" section of an AI prompt.
export function sanitizeForPrompt(text, max = 12000) {
  return String(text || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/"""/g, "””")
    .replace(/<\/?(cv|cv_text|document|system|instructions?)[^>]*>/gi, "")
    .slice(0, max);
}
