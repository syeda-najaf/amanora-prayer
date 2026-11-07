import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

export { supabaseConfigured };

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession()
      .then(({ data }) => { if (alive) { setSession(data.session); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(next); setLoading(false);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  return { session, loading, recovery, clearRecovery: () => setRecovery(false) };
}

const friendly = (m: string) => {
  if (/invalid login/i.test(m)) return "Wrong email or password.";
  if (/email not confirmed/i.test(m)) return "Please confirm your email first. Check your inbox.";
  if (/already registered|already been registered/i.test(m)) return "This email is already registered. Please sign in.";
  if (/rate limit|too many/i.test(m)) return "Too many attempts. Please wait a minute and try again.";
  if (/network|fetch/i.test(m)) return "No internet connection.";
  return m;
};

export async function registerUser(v: { email: string; password: string; fullName: string; phone: string; city: string }) {
  if (!supabase) throw new Error("Accounts are not available right now.");
  const { data, error } = await supabase.auth.signUp({
    email: v.email.trim(), password: v.password,
    options: { data: { full_name: v.fullName.trim(), phone: v.phone.trim(), city: v.city.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) throw new Error(friendly(error.message));
  if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error("This email is already registered. Please sign in.");
  return { needsConfirm: !data.session };
}

export async function loginUser(email: string, password: string) {
  if (!supabase) throw new Error("Accounts are not available right now.");
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(friendly(error.message));
}

export async function sendReset(email: string) {
  if (!supabase) throw new Error("Accounts are not available right now.");
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
  if (error) throw new Error(friendly(error.message));
}

export async function setNewPassword(password: string) {
  if (!supabase) throw new Error("Accounts are not available right now.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(friendly(error.message));
}

export async function logoutUser() { await supabase?.auth.signOut(); }
