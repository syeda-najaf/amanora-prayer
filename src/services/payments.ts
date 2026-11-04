import { supabase } from "./supabase";

export type CreatedOrder = {
  order_id: string;
  amount_paise: number;
  currency: "INR";
  key_id: string; // public Razorpay checkout key
  plan: "monthly" | "yearly";
};

/**
 * Asks the server to create a payment order. The price is decided server-side.
 * IMPORTANT: a successful checkout in the browser does NOT unlock Plus.
 * Plus is granted only when the signed webhook is verified; refresh the subscription afterwards.
 */
export async function createPlusOrder(plan: "monthly" | "yearly"): Promise<CreatedOrder> {
  if (!supabase) throw new Error("Payments are unavailable right now.");
  const { data, error } = await supabase.functions.invoke("create-order", { body: { plan } });
  if (error || !data?.order_id) throw new Error("Could not start payment. Please sign in and try again.");
  return data as CreatedOrder;
}
