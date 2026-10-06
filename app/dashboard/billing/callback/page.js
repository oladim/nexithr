"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { IconCheck, IconClock, IconRefresh } from "@/components/Icons";

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={<div className="assess"><div className="page-head"><h1>Confirming payment…</h1></div></div>}>
      <Callback />
    </Suspense>
  );
}

function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("reference") || params.get("trxref");
  const [state, setState] = useState("verifying"); // verifying | success | failed | error
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!reference) { setState("error"); setErr("No payment reference."); return; }
    (async () => {
      try {
        const res = await fetch("/api/payments/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (!res.ok) { setState("error"); setErr(data.error || "Verification failed"); return; }
        if (data.ok) { setInfo(data); setState("success"); }
        else { setState("failed"); }
      } catch (e) {
        setState("error"); setErr(e.message);
      }
    })();
  }, [reference]);

  const back = () => {
    let to = "/dashboard";
    try { to = sessionStorage.getItem("nexit.returnTo") || "/dashboard"; } catch {}
    router.push(to);
  };

  return (
    <div className="assess">
      <div className="page-head">
        <h1>
          {state === "verifying" ? "Confirming your payment…" : state === "success" ? "Payment confirmed" : "Payment not completed"}
        </h1>
        <p>
          {state === "verifying"
            ? "Please wait while we confirm your transaction."
            : state === "success"
            ? "Thank you — your purchase is active."
            : "We couldn't confirm this payment."}
        </p>
      </div>

      {state === "verifying" && (
        <div className="feedback-card"><p>Verifying reference <code>{reference}</code>…</p></div>
      )}

      {state === "success" && (
        <div className="feedback-card" style={{ background: "rgba(46,204,113,.10)", borderColor: "rgba(46,204,113,.3)" }}>
          <h5 style={{ marginTop: 0 }}><IconCheck width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> {info?.purpose === "subscription" ? "Annual subscription active" : "Specific training unlocked"}</h5>
          <p style={{ margin: 0 }}>
            {info?.purpose === "subscription"
              ? "You now have unlimited AI interview retakes and access to suggested training."
              : "Your specific training for this role is unlocked. You'll be invited to the live practical sessions when the programme reaches that stage."}
          </p>
        </div>
      )}

      {(state === "failed" || state === "error") && (
        <div className="feedback-card" style={{ background: "rgba(255,77,77,.08)", borderColor: "rgba(255,77,77,.3)" }}>
          <p style={{ margin: 0 }}>{err || "The payment wasn't successful. If you were charged, contact support with your reference."}</p>
          {reference && <p style={{ marginTop: 8, fontSize: 12, color: "var(--gray-500)" }}>Reference: <code>{reference}</code></p>}
        </div>
      )}

      <div className="assess-actions">
        <button className="btn-solid" onClick={back}>Continue</button>
        {(state === "failed" || state === "error") && (
          <Link href="/dashboard/interview/ai" className="btn-outline"><IconRefresh width={16} height={16} /> Back to interview</Link>
        )}
      </div>
    </div>
  );
}
