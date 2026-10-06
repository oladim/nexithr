"use client";

import { ACTIVITIES, TRANSACTIONS } from "@/components/interviewer/data";
import { IconCheck } from "@/components/Icons";

export default function InterviewerEarnings() {
  return (
    <>
      <div className="page-head">
        <h1>Total Money Earned</h1>
        <p>Your interview earnings, recent activity and transactions.</p>
      </div>

      <div className="iv-2col" style={{ marginBottom: 24 }}>
        <div className="wallet-hero">
          <div>
            <div className="sub">Available balance (USD)</div>
            <div className="big">$150,946.55</div>
            <div className="row2">
              <span>Received<br /><b>$344,506</b></span>
              <span>Withdrawn<br /><b>$238,000</b></span>
            </div>
          </div>
          <button className="withdraw">Withdraw</button>
        </div>

        <div className="card pad">
          <h3 className="card-title">Recent Activities</h3>
          <div className="activities">
            {ACTIVITIES.map((a, i) => (
              <div className="act-row" key={i}>
                <span className="ai2"><IconCheck /></span>
                <span className="grow">{a.type} <span style={{ color: "var(--gray-500)", fontSize: 12 }}>· successful</span></span>
                <span className="amt2">{a.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3 className="card-title">Transactions</h3>
        <table className="tbl">
          <thead>
            <tr><th>Sender</th><th>Type</th><th>Status</th><th>Date</th><th>Amount</th><th></th></tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t, i) => (
              <tr key={i}>
                <td>{t.name}</td>
                <td>{t.type}</td>
                <td><span className={`pill-status ${t.status.toLowerCase()}`}>{t.status}</span></td>
                <td>{t.date}</td>
                <td>{t.amount}</td>
                <td><button className="mini-btn">Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
