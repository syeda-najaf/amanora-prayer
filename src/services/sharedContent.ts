export type SharedContentItem = {
  id: string;
  content_type: string;
  title: string;
  body: string | null;
  body_ur: string | null;
  body_ar: string | null;
  reference: string | null;
  source_name: string | null;
  source_url: string | null;
  media_url: string | null;
  media_kind: string | null;
  language: string;
  presenter_type: string | null;
  published_at: string | null;
};

const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sharedContentConfigured = Boolean(url && anonKey);

export async function fetchPublishedContent(limit = 30): Promise<SharedContentItem[]> {
  if (!url || !anonKey) return [];
  const endpoint = `${url}/rest/v1/amanora_content?select=id,content_type,title,body,body_ur,body_ar,reference,source_name,source_url,media_url,media_kind,language,presenter_type,published_at&status=eq.published&order=published_at.desc&limit=${limit}`;
  const response = await fetch(endpoint, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
  if (!response.ok) throw new Error(`Shared content service returned ${response.status}`);
  return response.json();
}
