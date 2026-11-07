import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Member = { user_id: string; email: string; full_name: string | null; phone: string | null; city: string | null; registered_at: string; plan_code: string | null; plus_until: string | null; plus_active: boolean };

export function OwnerMembers({ client }: { client: SupabaseClient }) {
  const [rows, setRows] = useState<Member[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [days, setDays] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await client.rpc("amanora_admin_members");
    if (error) setMsg("Could not load members. Run the members SQL migration in Supabase. (" + error.message + ")");
    else { setRows((data as Member[]) || []); setMsg(""); }
  }, [client]);
  useEffect(() => { void load(); }, [load]);

  const grant = async (email: string, plan: "monthly" | "yearly") => {
    setBusy(true);
    const d = Number(days);
    const { data, error } = await client.rpc("amanora_admin_grant_plus", { p_email: email, p_plan: plan, p_days: d > 0 ? d : null });
    setBusy(false);
    if (error) setMsg(error.message); else { setMsg(`Plus activated for ${email} until ${new Date(data as string).toLocaleDateString()}.`); void load(); }
  };
  const revoke = async (email: string) => {
    if (!window.confirm(`Switch off Plus for ${email}?`)) return;
    setBusy(true);
    const { error } = await client.rpc("amanora_admin_revoke_plus", { p_email: email });
    setBusy(false);
    if (error) setMsg(error.message); else { setMsg(`Plus switched off for ${email}.`); void load(); }
  };

  const f = rows.filter((r) => `${r.email} ${r.full_name ?? ""} ${r.phone ?? ""} ${r.city ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return <section className="owner-card">
    <div className="owner-stats">
      <div><strong>{rows.length}</strong><span>Registered users</span></div>
      <div><strong>{rows.filter((r) => r.plus_active).length}</strong><span>Active Plus</span></div>
    </div>
    <h2>Members</h2>
    <p className="owner-muted">After you verify a UPI payment, search the user's email and tap Activate. Plus unlocks on their account straight away.</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "8px 0" }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, city" style={{ flex: 1, minWidth: 180, padding: 8 }} />
      <input value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} placeholder="Custom days (optional)" style={{ width: 170, padding: 8 }} />
      <button className="owner-secondary" onClick={() => void load()}>Refresh</button>
    </div>
    {msg && <p className="owner-notice owner-muted">{msg}</p>}
    <div style={{ overflowX: "auto" }}>
      {f.map((r) => <div key={r.user_id} style={{ borderTop: "1px solid rgba(128,128,128,.25)", padding: "10px 0" }}>
        <b>{r.full_name || "No name"}</b> · {r.email}<br />
        <small>{r.phone || "no phone"}{r.city ? ` · ${r.city}` : ""} · joined {new Date(r.registered_at).toLocaleDateString()}</small><br />
        <small>{r.plus_active ? `Plus (${r.plan_code}) until ${new Date(r.plus_until!).toLocaleDateString()}` : "Free"}</small>
        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <button className="owner-primary" disabled={busy} onClick={() => void grant(r.email, "monthly")}>Activate monthly</button>
          <button className="owner-primary" disabled={busy} onClick={() => void grant(r.email, "yearly")}>Activate yearly</button>
          {r.plus_active && <button className="owner-secondary" disabled={busy} onClick={() => void revoke(r.email)}>Switch off</button>}
        </div>
      </div>)}
      {f.length === 0 && <p className="owner-muted">No members found.</p>}
    </div>
  </section>;
}
