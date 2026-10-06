"use client";

import { useEffect, useState } from "react";
import { IconGoogle, IconApple } from "@/components/Icons";

// The "or / Continue with Google / Continue with Apple" block shared by Login
// and Sign Up. Each provider is shown only when an admin has enabled it in
// Admin → System Settings (Sign-in options). If neither is enabled, nothing
// renders (not even the divider).
export default function OAuthButtons() {
  const [cfg, setCfg] = useState(null); // { google, apple }

  useEffect(() => {
    (async () => {
      try {
        const s = await (await fetch("/api/settings")).json();
        setCfg({ google: !!s?.settings?.oauthGoogleEnabled, apple: !!s?.settings?.oauthAppleEnabled });
      } catch { setCfg({ google: false, apple: false }); }
    })();
  }, []);

  if (!cfg || (!cfg.google && !cfg.apple)) return null;

  return (
    <>
      <div className="or-divider">
        <span>or</span>
      </div>
      <div className="oauth-btns">
        {cfg.google && (
          <button type="button" className="oauth-btn">
            <IconGoogle />
            Continue with Google
          </button>
        )}
        {cfg.apple && (
          <button type="button" className="oauth-btn">
            <IconApple />
            Continue with Apple
          </button>
        )}
      </div>
    </>
  );
}
