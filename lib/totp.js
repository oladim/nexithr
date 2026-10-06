/**
 * TOTP (RFC 6238) — Google Authenticator compatible. SERVER ONLY.
 *
 * App-level second factor implemented with Node crypto (HMAC-SHA1), independent
 * of Supabase's MFA. Secrets are base32; codes are 6 digits on a 30s period.
 */
import crypto from "crypto";

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf) {
  let bits = 0, value = 0, out = "";
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | buf[i];
    bits += 8;
    while (bits >= 5) { out += B32_ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  const clean = String(str || "").toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0, value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

// A fresh base32 secret (160 bits).
export function generateSecret() {
  return base32Encode(crypto.randomBytes(20));
}

// otpauth:// URI that Google Authenticator scans.
export function otpauthUrl({ secret, label, issuer = "NexIT-Africa" }) {
  const l = encodeURIComponent(`${issuer}:${label}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${l}?${params.toString()}`;
}

function hotp(secretBuf, counter, digits = 6) {
  const buf = Buffer.alloc(8);
  // 64-bit big-endian counter
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", secretBuf).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(bin % 10 ** digits).padStart(digits, "0");
}

// Verify a user-entered code against the secret, allowing ±`window` steps.
export function verifyTotp(secret, token, { window = 1, period = 30 } = {}) {
  const code = String(token || "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const secretBuf = base32Decode(secret);
  if (secretBuf.length === 0) return false;
  const counter = Math.floor(Date.now() / 1000 / period);
  for (let w = -window; w <= window; w++) {
    if (hotp(secretBuf, counter + w) === code) return true;
  }
  return false;
}
