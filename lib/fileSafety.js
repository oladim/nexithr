/**
 * Server-side checks for files uploaded by candidates. SERVER ONLY.
 *
 * A CV is accepted only if it really is a PDF or a Word .docx (checked from
 * the bytes, not the file name or the browser's claimed type), is within the
 * size limit, carries nothing active (scripts, launch actions, embedded files,
 * macros, remote templates) and can actually be read. Everything is parsed
 * with hard limits on size, time and entry counts, so a hostile or broken
 * file can't hang or exhaust the server.
 *
 * Nothing here executes the file: we only read bytes and extract text.
 */
import zlib from "zlib";

export const CV_MAX_BYTES = 5 * 1024 * 1024;
export const CV_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const PDF_MAX_PAGES = 40;
const PARSE_TIMEOUT_MS = 15000;
const INFLATE_MAX = 8 * 1024 * 1024;       // max bytes we'll inflate from one stream / entry
const INFLATE_TOTAL_MAX = 40 * 1024 * 1024; // across the whole file
const ZIP_MAX_ENTRIES = 1500;
const ZIP_MAX_TOTAL = 60 * 1024 * 1024;     // declared uncompressed total (zip-bomb guard)

const fail = (reason, code = "invalid") => ({ ok: false, code, reason });

// ---------- names ----------
// A safe display name: no paths, control characters or markup; sensible length.
export function cleanFileName(name, ext) {
  let n = String(name || "").split(/[\\/]/).pop() || "";
  n = n.normalize("NFKC").replace(/[\u0000-\u001f\u007f<>:"|?*`$;{}\[\]]+/g, "").replace(/\s+/g, " ").trim();
  n = n.replace(/\.+$/, "").replace(/^\.+/, "");
  const base = n.replace(/\.[A-Za-z0-9]{1,5}$/, "").slice(0, 100).trim() || "CV";
  return `${base}.${ext}`;
}

export function extOf(name) {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(String(name || ""));
  return m ? m[1].toLowerCase() : "";
}

// ---------- type sniffing ----------
export function sniffType(buf) {
  if (!buf || buf.length < 8) return null;
  // PDF: "%PDF-" must appear in the first 1 KB (the spec allows a short preamble).
  const head = buf.subarray(0, 1024).toString("latin1");
  if (head.indexOf("%PDF-") !== -1) return "pdf";
  // ZIP local file header (DOCX is a zip). Confirmed as Word by inspectDocx.
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return "zip";
  // Old binary .doc (OLE) — explicitly unsupported (macros, legacy exploits).
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return "ole";
  return null;
}

const withTimeout = (p, ms, label) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))]);

// ---------- PDF ----------
// Decode "#xx" escapes in PDF names (/J#61vaScript → /JavaScript) so
// obfuscated keys are caught too.
const decodeNames = (s) => s.replace(/\/[^\s/<>\[\]()]+/g, (m) => m.replace(/#([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));

const PDF_ACTIVE = [
  [/\/JavaScript\b/, "contains JavaScript"],
  [/\/JS\b/, "contains JavaScript"],
  [/\/Launch\b/, "tries to launch other programs"],
  [/\/EmbeddedFiles?\b/, "has files embedded inside it"],
  [/\/RichMedia\b/, "contains embedded media (Flash)"],
  [/\/XFA\b/, "is an XFA/dynamic form"],
  [/\/SubmitForm\b/, "contains a form that sends data"],
  [/\/ImportData\b/, "imports external data"],
  [/\/GoToE\b/, "links to embedded files"],
];

function scanPdfText(text) {
  const t = decodeNames(text);
  for (const [re, why] of PDF_ACTIVE) if (re.test(t)) return why;
  return null;
}

export async function inspectPdf(buf) {
  const raw = buf.toString("latin1");
  if (raw.indexOf("%PDF-") === -1) return fail("This isn't a valid PDF.");
  if (raw.lastIndexOf("%%EOF") === -1) return fail("This PDF looks incomplete or damaged. Please export it again.");
  if (/\/Encrypt\b/.test(decodeNames(raw))) return fail("This PDF is password-protected or encrypted. Please upload an unprotected copy.", "encrypted");

  // 1) Plain (uncompressed) objects.
  let why = scanPdfText(raw);
  // 2) Compressed streams — object streams can hide the same keys.
  if (!why) {
    let total = 0;
    const re = /(?<!end)stream\r?\n/g;
    let m;
    let count = 0;
    while ((m = re.exec(raw)) && !why) {
      if (++count > 5000) break;
      const start = m.index + m[0].length;
      const end = raw.indexOf("endstream", start);
      if (end === -1) break;
      // Dictionaries (where /JS, /Launch … live) can only hide inside object
      // streams, so only those are inflated — not page content or images.
      const win = raw.slice(Math.max(0, m.index - 600), m.index);
      const o = win.lastIndexOf(" obj");
      const dict = o >= 0 ? win.slice(o) : win;
      if (!/\/Type\s*\/ObjStm/.test(dict) || !/FlateDecode/.test(dict)) { re.lastIndex = end + 9; continue; }
      try {
        const out = zlib.inflateSync(buf.subarray(start, end), { maxOutputLength: INFLATE_MAX });
        total += out.length;
        if (total > INFLATE_TOTAL_MAX) return fail("This PDF is unusually large inside. Please export it again (File → Save as PDF).", "too_complex");
        why = scanPdfText(out.toString("latin1"));
      } catch { /* not inflatable / truncated — ignore this stream */ }
      re.lastIndex = end + 9;
    }
  }
  if (why) return fail(`This PDF ${why}, so we can't accept it. Please export or "print to PDF" a plain copy of your CV and upload that.`, "active_content");

  // 3) It must actually open and give text, within limits.
  try {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await withTimeout(getDocumentProxy(new Uint8Array(buf), { isEvalSupported: false, disableFontFace: true }), PARSE_TIMEOUT_MS, "Opening the PDF");
    if (pdf.numPages > PDF_MAX_PAGES) return fail(`Your CV has ${pdf.numPages} pages. Please keep it to ${PDF_MAX_PAGES} pages or fewer.`, "too_long");
    const { text } = await withTimeout(extractText(pdf, { mergePages: true }), PARSE_TIMEOUT_MS, "Reading the PDF");
    const out = String(Array.isArray(text) ? text.join("\n") : text || "").trim();
    return { ok: true, type: "pdf", pages: pdf.numPages, text: out, scanned: out.length < 40 };
  } catch (e) {
    return fail("We couldn't open this PDF — it may be damaged. Please export it again and re-upload.", "unreadable");
  }
}

// ---------- DOCX (zip) ----------
// Minimal, bounded zip reader: central directory only, no extraction to disk.
function readZipDirectory(buf) {
  // End of central directory: last 64 KB + 22 bytes.
  const from = Math.max(0, buf.length - 65557);
  let eocd = -1;
  for (let i = buf.length - 22; i >= from; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd === -1) throw new Error("not a zip");
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOff = buf.readUInt32LE(eocd + 16);
  if (count > ZIP_MAX_ENTRIES) throw new Error("too many entries");
  if (cdOff + cdSize > buf.length) throw new Error("bad directory");
  const entries = [];
  let p = cdOff;
  for (let i = 0; i < count; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw new Error("bad entry");
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nlen = buf.readUInt16LE(p + 28);
    const xlen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nlen).toString("utf8");
    entries.push({ name, flags, method, csize, usize, local });
    p += 46 + nlen + xlen + clen;
  }
  return entries;
}

function readZipEntry(buf, e) {
  if (e.flags & 0x1) throw new Error("encrypted entry");
  const p = e.local;
  if (p + 30 > buf.length || buf.readUInt32LE(p) !== 0x04034b50) throw new Error("bad local header");
  const start = p + 30 + buf.readUInt16LE(p + 26) + buf.readUInt16LE(p + 28);
  const data = buf.subarray(start, start + e.csize);
  if (e.method === 0) return data.subarray(0, INFLATE_MAX);
  if (e.method === 8) return zlib.inflateRawSync(data, { maxOutputLength: INFLATE_MAX });
  throw new Error("unsupported compression");
}

// Word XML → plain text (paragraphs, tabs, line breaks).
function docxXmlToText(xml) {
  return xml
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function inspectDocx(buf) {
  let entries;
  try { entries = readZipDirectory(buf); } catch { return fail("This isn't a valid Word (.docx) file."); }
  const names = entries.map((e) => e.name);
  const total = entries.reduce((s, e) => s + e.usize, 0);
  if (total > ZIP_MAX_TOTAL) return fail("This document is unusually large inside. Please save it again or upload a PDF.", "too_complex");
  if (entries.some((e) => e.csize > 0 && e.usize / e.csize > 200 && e.usize > 1024 * 1024)) return fail("This document looks malformed. Please save it again or upload a PDF.", "too_complex");
  if (names.some((n) => n.startsWith("/") || n.includes("..") || n.includes("\\"))) return fail("This document looks malformed. Please save it again or upload a PDF.");
  if (!names.includes("[Content_Types].xml") || !names.includes("word/document.xml")) return fail("This isn't a Word (.docx) document. Please upload a PDF or .docx.");

  const lower = names.map((n) => n.toLowerCase());
  if (lower.some((n) => n.endsWith("vbaproject.bin") || n.endsWith("vbadata.xml"))) return fail("This document contains macros, so we can't accept it. Please save it as a regular .docx or PDF.", "active_content");
  if (lower.some((n) => n.startsWith("word/activex/"))) return fail("This document contains ActiveX controls, so we can't accept it. Please save it as a PDF.", "active_content");
  if (lower.some((n) => n.startsWith("word/embeddings/"))) return fail("This document has other files embedded in it. Please remove them, or save your CV as a PDF.", "active_content");

  try {
    const ct = readZipEntry(buf, entries.find((e) => e.name === "[Content_Types].xml")).toString("utf8");
    if (/macroEnabled|vbaProject/i.test(ct)) return fail("This document is macro-enabled, so we can't accept it. Please save it as a regular .docx or PDF.", "active_content");
    // Remote templates / external frames (used to pull in hostile content when opened).
    for (const e of entries.filter((x) => /^word\/_rels\/.+\.rels$/i.test(x.name))) {
      const rels = readZipEntry(buf, e).toString("utf8");
      const external = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).filter((r) => /TargetMode\s*=\s*"External"/i.test(r));
      if (external.some((r) => /attachedTemplate|frame|subDocument|oleObject/i.test(r))) {
        return fail("This document loads content from the internet when opened, so we can't accept it. Please save it as a PDF.", "active_content");
      }
    }
    const xml = readZipEntry(buf, entries.find((e) => e.name === "word/document.xml")).toString("utf8");
    const text = docxXmlToText(xml);
    return { ok: true, type: "docx", text, scanned: text.length < 40 };
  } catch {
    return fail("We couldn't read this document — it may be damaged. Please save it again or upload a PDF.", "unreadable");
  }
}

/**
 * Validate an uploaded CV. Returns
 *   { ok: true, type: "pdf"|"docx", contentType, text, scanned }
 *   { ok: false, code, reason }   — reason is safe to show the candidate.
 */
export async function inspectCv(buf, fileName) {
  if (!buf || !buf.length) return fail("The file is empty.");
  if (buf.length > CV_MAX_BYTES) return fail("Your CV is larger than 5 MB. Please upload a smaller file.", "too_large");
  const kind = sniffType(buf);
  const ext = extOf(fileName);
  if (kind === "ole" || ext === "doc") return fail("Old Word (.doc) files aren't accepted. Please save your CV as .docx or PDF.", "type");
  let res;
  if (kind === "pdf") res = await inspectPdf(buf);
  else if (kind === "zip") res = await inspectDocx(buf);
  else return fail("Only PDF and Word (.docx) files are accepted.", "type");
  if (!res.ok) return res;
  return { ...res, contentType: CV_TYPES[res.type] };
}

// Read text from a stored CV (PDF or DOCX) for analysis. { text, error }.
export async function extractCvTextSafe(buf) {
  const kind = sniffType(buf);
  if (kind === "zip") {
    const r = await inspectDocx(buf);
    return r.ok ? { text: r.text, error: r.text ? null : "The document has no text." } : { text: "", error: r.reason };
  }
  return null; // not a docx — caller uses the PDF extractor
}

// ---------- images (avatars) ----------
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export function sniffImage(buf) {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  return null;
}

export { sanitizeForPrompt } from "./promptSafety";
