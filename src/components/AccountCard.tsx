import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { logoutUser, supabaseConfigured, useSession } from "../services/auth";
import { usePlus } from "../services/plusStatus";
import { toast } from "../lib";

export function AccountCard() {
  const { session } = useSession();
  const plus = usePlus();
  const [p, setP] = useState({ full_name: "", phone: "", city: "" });
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const uid = session?.user?.id;

  useEffect(() => {
    if (!supabase || !uid) return;
    supabase.from("amanora_profiles").select("full_name,phone,city").eq("user_id", uid).maybeSingle()
      .then(({ data }) => { if (data) setP({ full_name: data.full_name ?? "", phone: data.phone ?? "", city: data.city ?? "" }); });
  }, [uid]);

  if (!supabaseConfigured || !session) return null;

  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.from("amanora_profiles").update({ full_name: p.full_name.trim(), phone: p.phone.trim(), city: p.city.trim(), updated_at: new Date().toISOString() }).eq("user_id", session.user.id);
    setBusy(false);
    if (error) toast("Could not save your details."); else { toast("Details saved."); setEdit(false); }
  };
  const del = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.functions.invoke("delete-account", { body: { confirm: "DELETE" } });
    setBusy(false);
    if (error) { toast("Could not delete the account. Please contact support."); setConfirmDel(false); return; }
    await logoutUser();
  };

  return <div className="card">
    <div className="row between"><div><small className="gold">MY ACCOUNT</small><h3>{p.full_name || "Amanora member"}</h3></div><span className="pill">{plus.active ? "Plus" : "Free"}</span></div>
    <p className="small muted">{session.user.email}</p>
    {plus.active && <p className="small">Plus active until <b>{plus.end?.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</b></p>}
    {edit ? <>
      <input className="input" placeholder="Full name" value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} />
      <input className="input" placeholder="Phone" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} />
      <input className="input" placeholder="City" value={p.city} onChange={(e) => setP({ ...p, city: e.target.value })} />
      <div className="row gap-s"><button className="btn" disabled={busy} onClick={() => void save()}>Save</button><button className="chip" onClick={() => setEdit(false)}>Cancel</button></div>
    </> : <>
      <p className="small">{p.phone || "No phone"}{p.city ? ` · ${p.city}` : ""}</p>
      <div className="row gap-s wrap"><button className="chip" onClick={() => setEdit(true)}>Edit details</button><button className="chip" onClick={() => void logoutUser()}>Sign out</button></div>
    </>}
    {confirmDel && <p className="err small">This permanently deletes your account and Plus membership. Tap again to confirm.</p>}
    <button className="chip danger-chip" disabled={busy} onClick={() => void del()} style={{ marginTop: 8 }}>{confirmDel ? "Yes, delete my account" : "Delete my account"}</button>
  </div>;
}
