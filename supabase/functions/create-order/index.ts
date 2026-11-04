// Creates a Razorpay order for a signed-in user. Price comes from the DB, never the client.
// Deploy: supabase functions deploy create-order     (JWT verification ON)
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, ALLOWED_ORIGINS (comma-separated)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/security.ts';

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const cors = corsHeaders(req.headers.get('origin'), allowed);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!url || !anon || !service || !keyId || !keySecret) {
    console.error('create-order: server environment incomplete');
    return json({ error: 'Payments are not configured yet.' }, 503, cors);
  }

  // 1. Authenticate the caller from their JWT.
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: 'Please sign in first.' }, 401, cors);
  const user = userData.user;

  // 2. Validate input strictly.
  let planCode = '';
  try { planCode = String((await req.json())?.plan ?? ''); } catch { /* handled below */ }
  if (planCode !== 'monthly' && planCode !== 'yearly') return json({ error: 'Invalid plan.' }, 400, cors);

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: plan } = await admin.from('amanora_plans').select('code,amount_paise,currency,active').eq('code', planCode).maybeSingle();
  if (!plan || !plan.active) return json({ error: 'Plan unavailable.' }, 400, cors);

  // 3. Rate limit: max 5 new orders per user per 10 minutes.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await admin.from('amanora_payments').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).gte('created_at', since);
  if ((count ?? 0) >= 5) return json({ error: 'Too many attempts. Please wait a few minutes.' }, 429, cors);

  // 4. Create the order with Razorpay (server-to-server, secret never leaves here).
  const receipt = `amn_${crypto.randomUUID().replaceAll('-', '').slice(0, 30)}`;
  const rzp = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa(`${keyId}:${keySecret}`) },
    body: JSON.stringify({ amount: plan.amount_paise, currency: plan.currency, receipt, notes: { user_id: user.id, plan: plan.code } }),
  });
  if (!rzp.ok) {
    console.error('create-order: Razorpay returned', rzp.status);
    return json({ error: 'Could not start payment. Please try again.' }, 502, cors);
  }
  const order = await rzp.json();
  if (typeof order?.id !== 'string') return json({ error: 'Could not start payment.' }, 502, cors);

  // 5. Record the pending payment. Premium is NOT granted here.
  const { error: insErr } = await admin.from('amanora_payments').insert({
    user_id: user.id, plan_code: plan.code, amount_paise: plan.amount_paise, currency: plan.currency,
    provider: 'razorpay', provider_order_id: order.id, status: 'pending',
  });
  if (insErr) { console.error('create-order: insert failed', insErr.code); return json({ error: 'Could not start payment.' }, 500, cors); }

  // key_id is the PUBLIC checkout key, safe to return.
  return json({ order_id: order.id, amount_paise: plan.amount_paise, currency: plan.currency, key_id: keyId, plan: plan.code }, 200, cors);
});
