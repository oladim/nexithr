"use client";

import { useState } from "react";
import { IconChevronDown, IconEye, IconEyeOff } from "@/components/Icons";

/**
 * Two visual variants, matching the two input styles in the Figma auth screens:
 *  - variant="simple"   → label above a filled input (used on Login)
 *  - variant="outlined" → Material-style floating label on the border (Sign Up)
 */
export function TextField({
  label,
  variant = "outlined",
  type = "text",
  error,
  className = "",
  ...props
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  if (variant === "simple") {
    return (
      <div className={`field field-simple ${className}`}>
        {label && <label>{label}</label>}
        <div style={{ position: "relative" }}>
          <input type={inputType} {...props} />
          {isPassword && (
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                width: 20,
                height: 20,
              }}
            >
              {show ? <IconEyeOff /> : <IconEye />}
            </button>
          )}
        </div>
        {error && <div className="field-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className={`field field-outlined ${className}`}>
      <div className="box">
        {label && <label>{label}</label>}
        <input type={inputType} {...props} />
        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            style={{ color: "#64748b", width: 20, height: 20, flexShrink: 0 }}
          >
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export function SelectField({ label, variant = "outlined", children, className = "", ...props }) {
  if (variant === "simple") {
    return (
      <div className={`field field-simple ${className}`}>
        {label && <label>{label}</label>}
        <select {...props}>{children}</select>
      </div>
    );
  }
  return (
    <div className={`field field-outlined ${className}`}>
      <div className="box">
        {label && <label>{label}</label>}
        <select {...props}>{children}</select>
      </div>
      <span className="chev">
        <IconChevronDown width={20} height={20} />
      </span>
    </div>
  );
}
