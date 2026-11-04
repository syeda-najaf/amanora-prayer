// Razorpay webhook receiver. Grants Premium ONLY after a verified, signed event.
// Deploy: supabase functions deploy payment-webhook --no-verify-jwt
//   (Razorpay cannot send a Supabase JWT; authenticity comes from the HMAC signature.)
// Secrets: RAZORPAY_WEBHOOK_SECRET
// Dashboard events to enable: payment.captured, order.paid, payment.failed, refund.processed
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyHmacSignature } from '../_shared/security.ts';
import { parseRazorpayEvent } from '../_shared/razorpay.ts';

const MAX_BODY = 256 * 1024;
const text = (body: string, status: number) => new Response(body, { status });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return text('Method not allowed', 405);

  const url = Deno.env.get('SUPABASE_URL');
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!url || !service || !secret) { console.error('payment-webhook: environment incomplete'); return text('Server error', 500); }

  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY) return text('Payload too large', 413);
  const raw = await req.text();                       // RAW body: required for signature check
  if (raw.length > MAX_BODY) return text('Payload too large', 413);

  // 1. Authenticate the sender. No detail is returned on failure.
  const ok = await verifyHmacSignature(raw, req.headers.get('x-razorpay-signature'), secret);
  if (!ok) return text('Unauthorized', 401);

  const eventId = req.headers.get('x-razorpay-event-id');
  if (!eventId || eventId.length > 100) return text('Bad request', 400);

  let body: any;
  try { body = JSON.parse(raw); } catch { return text('Bad request', 400); }
  const ev = parseRazorpayEvent(body);

  const db = createClient(url, service, { auth: { persistSession: false } });

  // 2. Idempotency: record the event id; skip only if it was FULLY processed before.
  const summary = { type: String(body?.event ?? '').slice(0, 60), kind: ev.kind,
    order_id: (ev as any).orderId ?? null, payment_id: (ev as any).paymentId ?? null };
  const ins = await db.from('amanora_payment_events').insert({
    provider: 'razorpay', provider_event_id: eventId, event_type: summary.type, summary,
  });
  if (ins.error) {
    if (ins.error.code !== '23505') { console.error('payment-webhook: event insert failed', ins.error.code); return text('Server error', 500); }
    const { data: prev } = await db.from('amanora_payment_events').select('outcome')
      .eq('provider', 'razorpay').eq('provider_event_id', eventId).maybeSingle();
    if (prev?.outcome) return text('Duplicate', 200);
    // Previous attempt crashed before finishing: fall through and re-run. The SQL functions are idempotent.
  }

  // 3. Apply the state change inside a single DB transaction (SQL function).
  let outcome = 'ignored';
  try {
    if (ev.kind === 'success') {
      const { data, error } = await db.rpc('amanora_apply_payment_success', {
        p_order_id: ev.orderId, p_payment_id: ev.paymentId, p_amount_paise: ev.amountPaise, p_currency: ev.currency });
      if (error) throw error;
      outcome = String(data?.result ?? 'unknown');
    } else if (ev.kind === 'failed') {
      const { data, error } = await db.rpc('amanora_apply_payment_failed', {
        p_order_id: ev.orderId, p_payment_id: ev.paymentId, p_reason: ev.reason });
      if (error) throw error;
      outcome = String(data?.result ?? 'unknown');
    } else if (ev.kind === 'refund') {
      const { data, error } = await db.rpc('amanora_apply_payment_refund', {
        p_payment_id: ev.paymentId, p_refund_amount_paise: ev.refundAmountPaise });
      if (error) throw error;
      outcome = String(data?.result ?? 'unknown');
    }
  } catch (e) {
    console.error('payment-webhook: processing failed', (e as any)?.code ?? 'unknown');
    return text('Server error', 500);               // Razorpay will retry; processing is idempotent
  }

  await db.from('amanora_payment_events').update({ outcome, processed_at: new Date().toISOString() })
    .eq('provider', 'razorpay').eq('provider_event_id', eventId);
  return text('OK', 200);
});
