"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Six one-digit boxes. Typing moves forward, Backspace moves back, and
 * pasting a full code (or using the phone's one-time-code autofill) fills
 * every box at once.
 */
export default function CodeInput({ value, onChange, length = 6, disabled, invalid, autoFocus = true }) {
  const inputs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => { if (autoFocus) inputs.current[0]?.focus(); }, [autoFocus]);

  const setAt = (i, d) => {
    const next = digits.slice(); next[i] = d;
    onChange(next.join("").slice(0, length));
  };
  const fill = (text, from = 0) => {
    const clean = String(text || "").replace(/\D/g, "").slice(0, length - from);
    if (!clean) return;
    const next = digits.slice();
    for (let k = 0; k < clean.length; k++) next[from + k] = clean[k];
    onChange(next.join(""));
    inputs.current[Math.min(from + clean.length, length - 1)]?.focus();
  };

  return (
    <div className={`code-row ${invalid ? "invalid" : ""}`} role="group" aria-label={`${length}-digit code`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={i === 0 ? length : 1}
          value={d}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) { fill(v, i); return; } // autofill / paste into one box
            setAt(i, v);
            if (v && i < length - 1) inputs.current[i + 1]?.focus();
          }}
          onPaste={(e) => { e.preventDefault(); fill(e.clipboardData.getData("text"), i); }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) { inputs.current[i - 1]?.focus(); setAt(i - 1, ""); }
            if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < length - 1) inputs.current[i + 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}

// Seconds left before "Resend" is allowed again. start(n) restarts it.
export function useResendTimer(initial = 60) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return { left, start: (n = 60) => setLeft(n), ready: left <= 0 };
}

export const fmtSecs = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Supabase says "...you can only request this after 42 seconds" when asked too soon.
export function retryAfterSeconds(message) {
  const m = /after (\d+) second/i.exec(message || "");
  return m ? Number(m[1]) : null;
}
