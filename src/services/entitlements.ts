import { supabase } from "./supabase";

export type Subscription = {
  plan_code: "monthly" | "yearly";
  status: "active" | "expired";
  current_period_end: string;
};

export type PaymentReceipt = {
  id: string;
  receipt_no: string;
  plan_code: string;
  amount_paise: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  created_at: string;
  paid_at: string | null;
};

/**
 * Read-only view of the user's subscription. The database is the source of truth:
 * RLS lets a user read only their own row, and only the payment webhook can write it.
 * UI gating based on this is a convenience; server-side checks (RLS / amanora_has_plus) are the real gate.
 */
export async function fetchMySubscription(): Promise<Subscription | null> {
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("amanora_subscriptions")
    .select("plan_code,status,current_period_end")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load subscription.");
  return (data as Subscription | null) ?? null;
}

export function isPlusActive(sub: Subscription | null, now = Date.now()): boolean {
  return !!sub && new Date(sub.current_period_end).getTime() > now;
}

export async function fetchMyPayments(): Promise<PaymentReceipt[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("amanora_payments")
    .select("id,receipt_no,plan_code,amount_paise,currency,status,created_at,paid_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("Could not load payments.");
  return (data as PaymentReceipt[]) ?? [];
}
