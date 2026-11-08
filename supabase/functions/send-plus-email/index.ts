// Sends the "payment received" and "Plus activated" emails from the Amanora Gmail account.
// Only the owner (a row in amanora_admins) can call it, and it only sends when the database
// shows the member really has an active Plus subscription.
// Secrets needed: GMAIL_USER (amanoraprayer@gmail.com), GMAIL_APP_PASSWORD (16-character Google app password)
// Deploy: supabase functions deploy send-plus-email    (JWT verification ON)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const PRICE: Record<string, number> = { monthly: 99, yearly: 799 };
const NAME: Record<string, string> = { monthly: 'Monthly', yearly: 'Yearly' };
const DEFAULT_ORIGINS = ['https://amanora-prayer.vercel.app', 'http://localhost:5173'];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

function layout(title: string, bodyHtml: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #d9e5df;border-radius:14px;overflow:hidden">
<div style="background:#0f3d33;color:#fff;padding:18px 22px"><div style="font-size:12px;letter-spacing:2px;color:#f1d27a">AMANORA</div><div style="font-size:20px;font-weight:700;margin-top:4px">${esc(title)}</div></div>
<div style="padding:20px 22px;color:#1b2b25;font-size:15px;line-height:1.6">${bodyHtml}</div>
<div style="padding:12px 22px;background:#f4f8f6;color:#5a6d65;font-size:12px">Questions? Just reply to this email. Amanora, amanoraprayer@gmail.com</div></div>`;
}

Deno.serve(async (req) => {
  const allowed = [...(Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map((s) => s.trim()).filter(Boolean), ...DEFAULT_ORIGINS];
  const origin = req.headers.get('origin');
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': origin && allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const gmailUser = Deno.env.get('GMAIL_USER');
  const gmailPass = Deno.env.get('GMAIL_APP_PASSWORD');
  if (!url || !anon) return json({ error: 'Service unavailable.' }, 503);
  if (!gmailUser || !gmailPass) return json({ error: 'Email is not set up yet. Add GMAIL_USER and GMAIL_APP_PASSWORD secrets.' }, 503);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } });
  const { data: who } = await userClient.auth.getUser();
  if (!who?.user) return json({ error: 'Please sign in first.' }, 401);
  const { data: isAdmin } = await userClient.rpc('amanora_is_admin');
  if (isAdmin !== true) return json({ error: 'Not allowed.' }, 403);

  let email = '', kind = 'both';
  try { const b = await req.json(); email = String(b?.email ?? '').trim().toLowerCase(); kind = String(b?.kind ?? 'both'); } catch { /* handled below */ }
  if (!/^\S+@\S+\.\S+$/.test(email) || !['payment', 'activated', 'both'].includes(kind)) return json({ error: 'Invalid request.' }, 400);

  // The database is the source of truth: send only when Plus is really active.
  const { data: members, error: mErr } = await userClient.rpc('amanora_admin_members');
  if (mErr) return json({ error: 'Could not read members.' }, 500);
  const m = (members as any[] | null)?.find((r) => String(r.email).toLowerCase() === email);
  if (!m) return json({ error: 'No registered user with that email.' }, 404);
  if (!m.plus_active || !m.plan_code || !m.plus_until) return json({ error: 'Plus is not active for this user, so no email was sent.' }, 409);

  const plan = String(m.plan_code);
  const name = String(m.full_name || '').trim() || 'there';
  const ends = new Date(m.plus_until);
  const permanent = ends.getFullYear() > 2100;
  const amount = PRICE[plan] ?? 0;
  const today = fmt(new Date());

  const mails: { subject: string; text: string; html: string }[] = [];
  if (kind === 'payment' || kind === 'both') {
    mails.push({
      subject: 'Amanora: payment received, thank you',
      text: `Assalamu alaikum ${name},\n\nWe have received and verified your payment of Rs ${amount} for Amanora Plus (${NAME[plan] ?? plan}).\nJazakallahu khayran for supporting Amanora.\n\nYour membership is being activated.\n\nAmanora`,
      html: layout('Payment received', `<p>Assalamu alaikum ${esc(name)},</p><p>We have received and verified your payment of <b>₹${amount}</b> for <b>Amanora Plus ${esc(NAME[plan] ?? plan)}</b>.</p><p>Jazakallahu khayran for supporting Amanora. Your membership is being activated.</p>`),
    });
  }
  if (kind === 'activated' || kind === 'both') {
    const until = permanent ? 'Lifetime' : fmt(ends);
    mails.push({
      subject: 'Amanora Plus is now active',
      text: `Assalamu alaikum ${name},\n\nYour Amanora Plus membership is active.\n\nPlan: ${NAME[plan] ?? plan}\nActivated on: ${today}\nValid until: ${until}\nAccount: ${email}\n\nOpen Amanora and sign in with this email to use all Plus features.\n\nAmanora`,
      html: layout('Amanora Plus is active', `<p>Assalamu alaikum ${esc(name)},</p><p>Your Amanora Plus membership is now active.</p><table style="border-collapse:collapse;font-size:15px"><tr><td style="padding:4px 14px 4px 0;color:#5a6d65">Plan</td><td><b>${esc(NAME[plan] ?? plan)}</b></td></tr><tr><td style="padding:4px 14px 4px 0;color:#5a6d65">Activated on</td><td><b>${today}</b></td></tr><tr><td style="padding:4px 14px 4px 0;color:#5a6d65">Valid until</td><td><b>${until}</b></td></tr><tr><td style="padding:4px 14px 4px 0;color:#5a6d65">Account</td><td><b>${esc(email)}</b></td></tr></table><p>Open Amanora and sign in with this email to use all Plus features.</p>`),
    });
  }

  const client = new SMTPClient({ connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: gmailUser, password: gmailPass } } });
  try {
    for (const mail of mails) {
      await client.send({ from: `Amanora <${gmailUser}>`, replyTo: gmailUser, to: email, subject: mail.subject, content: mail.text, html: mail.html });
    }
  } catch (e) {
    console.error('send-plus-email failed', e);
    return json({ error: 'The email could not be sent. Check the Gmail app password.' }, 502);
  } finally {
    try { await client.close(); } catch { /* ignore */ }
  }
  return json({ ok: true, sent: mails.length });
});
