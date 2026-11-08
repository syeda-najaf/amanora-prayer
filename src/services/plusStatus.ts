import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { verifyCode } from "./plusCodes";
import type { PlusStatus } from "./plusCodes";

export * from "./plusCodes";

/* Plus status = account subscription (any device) or a device code.
   The last known account status is remembered on the phone, so Plus stays unlocked offline
   and after closing or refreshing the app. It is cleared when the account signs out. */
const CACHE_KEY = "amanora:plus-account-cache";
const NONE: PlusStatus = { active: false, plan: null, end: null };

const readCache = (uid: string): PlusStatus | null => {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null") as { uid: string; plan: "monthly" | "yearly"; end: string } | null;
    if (!c || c.uid !== uid) return null;
    const end = new Date(c.end);
    return end.getTime() > Date.now() ? { active: true, plan: c.plan, end } : null;
  } catch { return null; }
};
const writeCache = (uid: string, plan: "monthly" | "yearly", end: Date) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, plan, end: end.toISOString() })); } catch { /* ignore */ } };
const clearCache = () => { try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ } };

export function usePlus(): PlusStatus & { loading: boolean } {
  const [st, setSt] = useState<PlusStatus>(NONE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const run = async () => {
      let codeStatus: PlusStatus = NONE;
      try {
        const code = localStorage.getItem("amanora:plus-code") || "";
        if (code) { const r = await verifyCode(code); codeStatus = { active: r.active, plan: r.plan, end: r.end }; }
      } catch { /* ignore */ }
      const later = (a: PlusStatus, b: PlusStatus) => (a.active && (!b.active || (a.end && b.end && a.end > b.end)) ? a : b);
      let best = codeStatus;
      if (supabase) {
        let uid = "";
        try { uid = (await supabase.auth.getSession()).data.session?.user.id ?? ""; } catch { /* ignore */ }
        if (uid) {
          const cached = readCache(uid);
          try {
            const { data, error } = await supabase.from("amanora_subscriptions").select("plan_code,current_period_end").eq("user_id", uid).maybeSingle();
            if (error) throw error;
            const end = data ? new Date(data.current_period_end as string) : null;
            if (data && end && end.getTime() > Date.now()) {
              writeCache(uid, data.plan_code as "monthly" | "yearly", end);
              best = later({ active: true, plan: data.plan_code as "monthly" | "yearly", end }, codeStatus);
            } else clearCache();
          } catch {
            // Offline or server unreachable: keep the status remembered on this phone.
            if (cached) best = later(cached, codeStatus);
          }
        }
      }
      if (alive) { setSt(best); setLoading(false); }
    };
    void run();
    const on = () => void run();
    const timer = window.setInterval(on, 5 * 60 * 1000);
    window.addEventListener("amanora-plus-changed", on);
    document.addEventListener("visibilitychange", on);
    const sub = supabase?.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") clearCache(); on(); });
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener("amanora-plus-changed", on); document.removeEventListener("visibilitychange", on); sub?.data.subscription.unsubscribe(); };
  }, []);
  return { ...st, loading };
}
