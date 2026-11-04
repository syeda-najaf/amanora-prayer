// Pure Razorpay event parsing. Field names follow Razorpay's documented webhook payloads
// (payment.captured / order.paid / payment.failed / refund.processed).
// Verify against your Razorpay dashboard's test-mode webhooks before going live.

export type PaymentEvent =
  | { kind: 'success'; orderId: string; paymentId: string; amountPaise: number; currency: string }
  | { kind: 'failed'; orderId: string; paymentId: string; reason: string }
  | { kind: 'refund'; paymentId: string; refundAmountPaise: number }
  | { kind: 'ignore'; type: string };

type Json = Record<string, any>;

export function parseRazorpayEvent(body: Json): PaymentEvent {
  const type = String(body?.event ?? '');
  const payment: Json | undefined = body?.payload?.payment?.entity;

  if (type === 'payment.captured' || type === 'order.paid') {
    // order.paid carries payload.payment.entity too (the successful payment).
    if (payment && payment.status === 'captured'
        && typeof payment.order_id === 'string' && typeof payment.id === 'string'
        && Number.isInteger(payment.amount) && typeof payment.currency === 'string') {
      return { kind: 'success', orderId: payment.order_id, paymentId: payment.id,
               amountPaise: payment.amount, currency: payment.currency };
    }
    return { kind: 'ignore', type };
  }

  if (type === 'payment.failed') {
    if (payment && typeof payment.order_id === 'string' && typeof payment.id === 'string') {
      return { kind: 'failed', orderId: payment.order_id, paymentId: payment.id,
               reason: String(payment.error_code ?? payment.error_reason ?? 'failed').slice(0, 100) };
    }
    return { kind: 'ignore', type };
  }

  if (type === 'refund.processed') {
    const refund: Json | undefined = body?.payload?.refund?.entity;
    if (refund && typeof refund.payment_id === 'string' && Number.isInteger(refund.amount)) {
      return { kind: 'refund', paymentId: refund.payment_id, refundAmountPaise: refund.amount };
    }
    return { kind: 'ignore', type };
  }

  return { kind: 'ignore', type };
}
