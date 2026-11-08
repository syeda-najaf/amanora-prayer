import { useState } from "react";
import type { ReactNode } from "react";
import { activateCode, deviceId, prettyId, removeCode, usePlus } from "../services/plusStatus";
import { useSession } from "../services/auth";
import { shareText, toast } from "../lib";

const OWNER_EMAIL = "amanoraprayer@gmail.com";

export function PlusUnlock({ onPay }: { onPay: () => void }) {
  const plus = usePlus();
  const { session } = useSession();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const email = session?.user?.email ?? "";
  const name = (session?.user?.user_metadata?.full_name as string | undefined) ?? "";
  const id = prettyId(deviceId());
  const refresh = () => { window.dispatchEvent(new Event("amanora-plus-changed")); toast("Checking your Plus status…"); };

  if (plus.loading) return null;
  if (plus.active) return <div className="card" style={{ borderColor: "#d4af37" }}>
    <div className="row between"><div><small className="gold">AMANORA PLUS</small><h3>Plus is active</h3></div><span className="pill">{plus.plan === "yearly" ? "Yearly" : "Monthly"}</span></div>
    <p className="small">Active until <b>{plus.end?.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</b>. All Plus features are unlocked{email ? ` on your account (${email}).` : " on this device."}</p>
  </div>;

  const request = `Amanora Plus request\nName: ${name || "-"}\nAccount email: ${email || "-"}\nPlan: (monthly / yearly)\nPayment screenshot attached.`;
  const activate = async () => {
    setBusy(true); setErr("");
    const r = await activateCode(code);
    setBusy(false);
    if (r.active) { setCode(""); toast("Amanora Plus activated. Jazakallahu khayran."); }
    else setErr(r.error || "This code could not be used.");
  };
  return <div className="card">
    <small className="gold">UNLOCK AMANORA PLUS</small>
    <h3>Activate Plus on your account</h3>
    {email && <p className="small muted">Signed in as <b>{name || email}</b>{name ? ` (${email})` : ""}</p>}
    <ol className="small" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
      <li>Pay by UPI. Your account email is added to the payment note.</li>
      <li>Send the payment screenshot to {OWNER_EMAIL} with your account email.</li>
      <li>After the payment is verified, Plus unlocks automatically on your account, on every device.</li>
    </ol>
    <div className="row gap-s wrap"><button className="btn" onClick={onPay}>Pay by UPI</button><button className="chip" onClick={async () => { const r = await shareText("Amanora Plus request", request); toast(r === "copied" ? "Request copied. Send it with your screenshot." : r === "shared" ? "Request shared." : "Not shared."); }}>Send request</button><button className="chip" onClick={refresh}>I have paid · Refresh</button></div>
    <details style={{ marginTop: 12 }}>
      <summary className="small"><b>Have an activation code?</b></summary>
      <div className="dua-translation"><small className="muted">DEVICE ID (give this to the owner for a device code)</small><div><b style={{ letterSpacing: 2 }}>{id}</b></div></div>
      <textarea className="input" rows={3} value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }} placeholder="Paste activation code (starts with AMN1.)" />
      {err && <p className="err small">{err}</p>}
      <button className="btn wide gold-btn" disabled={busy || code.trim().length < 20} onClick={() => void activate()}>{busy ? "Checking…" : "Activate with code"}</button>
    </details>
  </div>;
}

export function Locked({ plus, onUnlock, children }: { plus: boolean; onUnlock: () => void; children: ReactNode }) {
  if (plus) return <>{children}</>;
  return <div className="plus-locked">
    <div className="plus-locked-inner" aria-hidden="true">{children}</div>
    <button className="plus-locked-badge" onClick={onUnlock}>🔒 Unlock with Amanora Plus</button>
  </div>;
}
