// Pure helpers (no Deno-only APIs) so they can be unit-tested under Node.

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison (compares SHA-256 digests, so length is not leaked). */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0 && a.length === b.length;
}

/** Hex HMAC-SHA256 of the RAW request body. Never parse the body before verifying. */
export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

export async function verifyHmacSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!secret || !signature) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return safeEqual(expected, signature.trim().toLowerCase());
}

export function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const ok = origin && allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin! : (allowed[0] ?? 'null'),
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}
