import { useEffect, useState } from "react";
import { fetchMySubscription } from "./entitlements";

/* Amanora Plus activation codes.
   The app holds only the PUBLIC key, so it can verify a code but nobody can create one without your private key.
   Codes are bound to one device ID and expire on a fixed date. */
const PUBLIC_KEY: JsonWebKey = {"kty":"EC","crv":"P-256","x":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","y":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"};
const EPOCH = Date.UTC(2024, 0, 1);
const DAY = 86400000;
const CODE_KEY = "amanora:plus-code";
const ID_KEY = "amanora:device-id";

export type PlusStatus = { active: boolean; plan: "monthly" | "yearly" | null; end: Date | null };
const INACTIVE: PlusStatus = { active: false, plan: null, end: null };

export function deviceId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id || !/^[0-9A-F]{8}$/.test(id)) {
      const b = crypto.getRandomValues(new Uint8Array(4));
      id = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch { return "00000000"; }
}
export const prettyId = (id: string) => id.slice(0, 4) + "-" + id.slice(4);

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function verifyCode(raw: string): Promise<PlusStatus & { error?: string }> {
  try {
    const text = raw.replace(/\s+/g, "");
    if (!text.startsWith("AMN1.")) return { ...INACTIVE, error: "This is not an Amanora code." };
    const bytes = b64urlToBytes(text.slice(5));
    if (bytes.length !== 72) return { ...INACTIVE, error: "The code is incomplete. Paste the whole code." };
    const payload = bytes.slice(0, 8), sig = bytes.slice(8);
    const key = await crypto.subtle.importKey("jwk", PUBLIC_KEY, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, payload);
    if (!ok) return { ...INACTIVE, error: "This code is not valid." };
    const id = Array.from(payload.slice(2, 6), (x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
    if (id !== deviceId()) return { ...INACTIVE, error: "This code was made for a different device." };
    const endDays = (payload[6] << 8) | payload[7];
    const end = new Date(EPOCH + (endDays + 1) * DAY);
    if (end.getTime() <= Date.now()) return { ...INACTIVE, error: "This code has expired." };
    return { active: true, plan: payload[1] === 2 ? "yearly" : "monthly", end };
  } catch { return { ...INACTIVE, error: "The code could not be checked." }; }
}

export async function activateCode(raw: string) {
  const r = await verifyCode(raw);
  if (r.active) {
    try { localStorage.setItem(CODE_KEY, raw.replace(/\s+/g, "")); } catch { /* storage unavailable */ }
    window.dispatchEvent(new Event("amanora-plus-changed"));
  }
  return r;
}

export function removeCode() {
  try { localStorage.removeItem(CODE_KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event("amanora-plus-changed"));
}

export function usePlus(): PlusStatus & { loading: boolean } {
  const [st, setSt] = useState<PlusStatus>(INACTIVE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      let code = "";
      try { code = localStorage.getItem(CODE_KEY) || ""; } catch { /* ignore */ }
      const r = code ? await verifyCode(code) : INACTIVE;
      let best: PlusStatus = { active: r.active, plan: r.plan, end: r.end };
      try {
        const sub = await fetchMySubscription();
        const end = sub ? new Date(sub.current_period_end) : null;
        if (sub && end && end.getTime() > Date.now() && (!best.end || end > best.end)) best = { active: true, plan: sub.plan_code, end };
      } catch { /* offline or not signed in: keep the device-code result */ }
      if (alive) { setSt(best); setLoading(false); }
    };
    void run();
    const on = () => void run();
    const timer = window.setInterval(on, 5 * 60 * 1000);
    window.addEventListener("amanora-plus-changed", on);
    document.addEventListener("visibilitychange", on);
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener("amanora-plus-changed", on); document.removeEventListener("visibilitychange", on); };
  }, []);
  return { ...st, loading };
}
