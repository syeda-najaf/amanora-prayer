import { supabase } from "./supabase";

export type ReportReason =
  | "incorrect_text" | "wrong_reference" | "translation_error" | "inappropriate" | "copyright" | "other";

export async function reportContent(contentId: string, reason: ReportReason, details?: string): Promise<void> {
  if (!supabase) throw new Error("Reporting is unavailable right now.");
  const { data: auth } = await supabase.auth.getUser();
  const clean = details?.trim().slice(0, 1000) || null;
  const { error } = await supabase.from("amanora_content_reports").insert({
    content_id: contentId,
    reason,
    details: clean,
    reporter_id: auth.user?.id ?? null,
  });
  if (error) {
    if (error.code === "23505") throw new Error("You have already reported this item. Thank you.");
    throw new Error("Could not send your report. Please try again.");
  }
}

/** Permanently deletes the signed-in user's account via a server function. */
export async function deleteMyAccount(): Promise<void> {
  if (!supabase) throw new Error("Account deletion is unavailable right now.");
  const { data, error } = await supabase.functions.invoke("delete-account", { body: { confirm: "DELETE" } });
  if (error || !data?.deleted) throw new Error("Could not delete the account. Please contact support.");
  await supabase.auth.signOut();
}
