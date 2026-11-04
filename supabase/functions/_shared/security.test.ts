import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { hmacSha256Hex, safeEqual, verifyHmacSignature, corsHeaders } from './security.ts';
import { parseRazorpayEvent } from './razorpay.ts';

const secret = 'whsec_test_123';
const body = JSON.stringify({ event: 'payment.captured', payload: {} });

test('hmac matches Node reference implementation', async () => {
  assert.equal(await hmacSha256Hex(secret, body), createHmac('sha256', secret).update(body).digest('hex'));
});
test('valid signature accepted', async () => {
  const sig = createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(await verifyHmacSignature(body, sig, secret), true);
});
test('tampered body rejected', async () => {
  const sig = createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(await verifyHmacSignature(body + ' ', sig, secret), false);
});
test('wrong secret / missing signature / empty secret rejected', async () => {
  const sig = createHmac('sha256', 'other').update(body).digest('hex');
  assert.equal(await verifyHmacSignature(body, sig, secret), false);
  assert.equal(await verifyHmacSignature(body, null, secret), false);
  assert.equal(await verifyHmacSignature(body, sig, ''), false);
});
test('safeEqual', async () => {
  assert.equal(await safeEqual('abc', 'abc'), true);
  assert.equal(await safeEqual('abc', 'abd'), false);
  assert.equal(await safeEqual('abc', 'abcd'), false);
});
test('cors only echoes allowed origins', () => {
  assert.equal(corsHeaders('https://evil.example', ['https://app.example'])['Access-Control-Allow-Origin'], 'https://app.example');
  assert.equal(corsHeaders('https://app.example', ['https://app.example'])['Access-Control-Allow-Origin'], 'https://app.example');
});

const captured = (over: any = {}) => ({ event: 'payment.captured', payload: { payment: { entity: {
  id: 'pay_1', order_id: 'order_1', amount: 9900, currency: 'INR', status: 'captured', ...over } } } });

test('captured -> success', () => {
  assert.deepEqual(parseRazorpayEvent(captured()), { kind: 'success', orderId: 'order_1', paymentId: 'pay_1', amountPaise: 9900, currency: 'INR' });
});
test('non-captured status never counts as success', () => {
  assert.equal(parseRazorpayEvent(captured({ status: 'authorized' })).kind, 'ignore');
  assert.equal(parseRazorpayEvent(captured({ status: 'failed' })).kind, 'ignore');
});
test('malformed amount ignored', () => {
  assert.equal(parseRazorpayEvent(captured({ amount: '9900' })).kind, 'ignore');
  assert.equal(parseRazorpayEvent(captured({ amount: 99.5 })).kind, 'ignore');
});
test('failed + refund + unknown', () => {
  assert.equal(parseRazorpayEvent({ event: 'payment.failed', payload: { payment: { entity: { id: 'p', order_id: 'o', error_code: 'BAD_REQUEST_ERROR' } } } }).kind, 'failed');
  assert.deepEqual(parseRazorpayEvent({ event: 'refund.processed', payload: { refund: { entity: { payment_id: 'pay_1', amount: 9900 } } } }),
    { kind: 'refund', paymentId: 'pay_1', refundAmountPaise: 9900 });
  assert.equal(parseRazorpayEvent({ event: 'something.else' }).kind, 'ignore');
  assert.equal(parseRazorpayEvent(null as any).kind, 'ignore');
});
