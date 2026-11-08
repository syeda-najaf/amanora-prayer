import { useState } from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser, resendConfirmation, sendReset, setNewPassword, supabaseConfigured, useSession } from "../services/auth";

type Mode = "register" | "login" | "forgot";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading, recovery, clearRecovery } = useSession();
  const [mode, setMode] = useState<Mode>("register");
  const [f, setF] = useState({ fullName: "", email: "", phone: "", city: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => { setF({ ...f, [k]: e.target.value }); setErr(""); };

  if (!supabaseConfigured) return <>{children}</>;
  if (loading) return <div className="auth-screen"><div className="auth-card" style={{ textAlign: "center" }}><div className="auth-seal">۞</div><p className="muted">Opening Amanora…</p></div></div>;

  if (recovery) return <div className="auth-screen"><form className="auth-card" onSubmit={async (e) => {
    e.preventDefault();
    if (f.password.length < 8) return setErr("Password must be at least 8 characters.");
    if (f.password !== f.confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try { await setNewPassword(f.password); clearRecovery(); } catch (x: any) { setErr(x.message); }
    setBusy(false);
  }}>
    <div className="auth-seal">۞</div><h2>Set a new password</h2>
    <input className="input" type="password" autoComplete="new-password" placeholder="New password (8+ characters)" value={f.password} onChange={set("password")} />
    <input className="input" type="password" autoComplete="new-password" placeholder="Confirm new password" value={f.confirm} onChange={set("confirm")} />
    {err && <p className="err small">{err}</p>}
    <button className="btn wide gold-btn" disabled={busy}>{busy ? "Saving…" : "Save password"}</button>
  </form></div>;

  if (session) return <>{children}</>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setInfo("");
    const email = f.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    setBusy(true);
    try {
      if (mode === "forgot") { await sendReset(email); setInfo("Password reset link sent. Check your email."); }
      else if (mode === "login") { await loginUser(email, f.password); }
      else {
        if (f.fullName.trim().length < 2) throw new Error("Enter your full name.");
        if (f.phone.replace(/\D/g, "").length < 7 || f.phone.replace(/\D/g, "").length > 15) throw new Error("Enter a valid phone number.");
        if (f.password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (f.password !== f.confirm) throw new Error("Passwords do not match.");
        if (!agree) throw new Error("Please accept the Privacy Policy to continue.");
        const r = await registerUser({ email, password: f.password, fullName: f.fullName, phone: f.phone, city: f.city });
        if (r.needsConfirm) { setInfo("Account created. Open the confirmation email we sent, then sign in."); setMode("login"); }
      }
    } catch (x: any) { setErr(x.message || "Something went wrong."); }
    setBusy(false);
  };

  return <div className="auth-screen"><form className="auth-card" onSubmit={submit}>
    <div className="auth-seal">۞</div>
    <small className="gold">AMANORA</small>
    <h2>{mode === "register" ? "Create your account" : mode === "login" ? "Welcome back" : "Reset password"}</h2>
    <p className="muted small">{mode === "register" ? "Register once to open Amanora. Your Plus membership stays with your account on every device." : mode === "login" ? "Sign in to continue." : "We will email you a link to choose a new password."}</p>
    {mode === "register" && <>
      <input className="input" autoComplete="name" placeholder="Full name" value={f.fullName} onChange={set("fullName")} />
      <input className="input" type="tel" autoComplete="tel" placeholder="Phone number" value={f.phone} onChange={set("phone")} />
      <input className="input" autoComplete="address-level2" placeholder="City (optional)" value={f.city} onChange={set("city")} />
    </>}
    <input className="input" type="email" autoComplete="email" placeholder="Email" value={f.email} onChange={set("email")} />
    {mode !== "forgot" && <input className="input" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder={mode === "register" ? "Password (8+ characters)" : "Password"} value={f.password} onChange={set("password")} />}
    {mode === "register" && <>
      <input className="input" type="password" autoComplete="new-password" placeholder="Confirm password" value={f.confirm} onChange={set("confirm")} />
      <label className="small" style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "8px 0" }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /><span>I agree to the Privacy Policy: Amanora keeps my name, email, phone and city to run my account and Plus membership, and does not sell my data.</span></label>
    </>}
    {err && <p className="err small">{err}</p>}
    {info && <p className="small" style={{ color: "#1d7a4a" }}>{info}</p>}
    {mode === "login" && /confirm your email/i.test(err) && <button type="button" className="chip" disabled={busy} onClick={async () => { setBusy(true); try { await resendConfirmation(f.email); setErr(""); setInfo("Confirmation email sent again. Open it, tap the link, then sign in. Check Spam too."); } catch (x: any) { setErr(x.message); } setBusy(false); }}>Resend confirmation email</button>}
    <button className="btn wide gold-btn" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "login" ? "Sign in" : "Send reset link"}</button>
    <div className="row between" style={{ marginTop: 10 }}>
      {mode !== "register" ? <button type="button" className="chip" onClick={() => { setMode("register"); setErr(""); setInfo(""); }}>New here? Register</button> : <button type="button" className="chip" onClick={() => { setMode("login"); setErr(""); setInfo(""); }}>Already registered? Sign in</button>}
      {mode === "login" && <button type="button" className="chip" onClick={() => { setMode("forgot"); setErr(""); setInfo(""); }}>Forgot password?</button>}
    </div>
  </form></div>;
}
