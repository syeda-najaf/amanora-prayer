// Lets a signed-in user permanently delete their own account (Google Play / privacy requirement).
// Deletes the auth user (subscriptions cascade). Payment rows are KEPT with user_id set to null,
// because financial records may need to be retained by law. Confirm retention rules with your accountant.
// Deploy: supabase functions deploy delete-account     (JWT verification ON)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/security.ts';

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const allowed = [...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean), 'https://amanora-prayer.vercel.app', 'http://localhost:5173'];
  const cors = corsHeaders(req.headers.get('origin'), allowed);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) return json({ error: 'Service unavailable.' }, 503, cors);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return json({ error: 'Please sign in first.' }, 401, cors);

  let confirm = '';
  try { confirm = String((await req.json())?.confirm ?? ''); } catch { /* handled below */ }
  if (confirm !== 'DELETE') return json({ error: 'Confirmation required.' }, 400, cors);

  const admin = createClient(url, service, { auth: { persistSession: false } });

  // Never let an administrator delete themselves through the app (protects the owner account).
  const { data: adminRow } = await admin.from('amanora_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
  if (adminRow) return json({ error: 'Administrator accounts must be removed manually.' }, 403, cors);

  const { error: delErr } = await admin.auth.admin.deleteUser(data.user.id);
  if (delErr) { console.error('delete-account: failed'); return json({ error: 'Could not delete the account. Please contact support.' }, 500, cors); }

  await admin.from('amanora_account_deletions').insert({ deleted_user_id: data.user.id });
  return json({ deleted: true }, 200, cors);
});
