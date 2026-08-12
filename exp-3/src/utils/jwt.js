// A self-contained JWT implementation that runs entirely in the browser,
// using the native Web Crypto API (crypto.subtle) to do REAL HMAC-SHA256
// signing and verification — the same algorithm the `jsonwebtoken` npm
// package uses on a Node backend.
//
// IMPORTANT (read this — it matters for the viva too):
// In a real production app, the signing secret must live ONLY on a server,
// because anything shipped in frontend JavaScript can be read by anyone
// (view-source, devtools, etc). Here, since this experiment has NO backend
// by design, the "secret" below is just a stand-in so we can demonstrate
// the actual sign -> transmit -> verify flow end-to-end in one place.
// This is fine for learning/demo purposes, but never do this in production.

const SECRET = 'frontend-only-demo-secret-do-not-use-in-production';
const encoder = new TextEncoder();

// ---------- base64url helpers ----------
// JWTs use base64url (base64 with +/ replaced by -/_ and no padding),
// not plain base64.

function base64urlEncodeBytes(bytes) {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlEncodeString(str) {
  return base64urlEncodeBytes(encoder.encode(str));
}

function base64urlDecodeToString(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  return atob(padded);
}

// ---------- HMAC key import ----------
async function getHmacKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a payload into a real 3-part JWT: header.payload.signature
 * Mirrors what `jwt.sign(payload, JWT_SECRET, { expiresIn })` does on a
 * Node/Express backend.
 */
export async function signToken(payload, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds };

  const headerEncoded = base64urlEncodeString(JSON.stringify(header));
  const payloadEncoded = base64urlEncodeString(JSON.stringify(fullPayload));
  const unsigned = `${headerEncoded}.${payloadEncoded}`;

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(unsigned));
  const signatureEncoded = base64urlEncodeBytes(new Uint8Array(signatureBuffer));

  return `${unsigned}.${signatureEncoded}`;
}

/**
 * Verifies a token's signature and expiry.
 * Mirrors what `jwt.verify(token, JWT_SECRET)` does on a backend.
 * Throws an Error with a descriptive message if invalid/expired.
 * Returns the decoded payload if valid.
 */
export async function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token.');

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  const unsigned = `${headerEncoded}.${payloadEncoded}`;

  const key = await getHmacKey();

  // Re-derive raw signature bytes from base64url for crypto.subtle.verify
  const sigBinary = base64urlDecodeToString(signatureEncoded);
  const sigBytes = Uint8Array.from(sigBinary, (c) => c.charCodeAt(0));

  const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(unsigned));
  if (!isValid) throw new Error('Invalid token signature.');

  const payload = JSON.parse(base64urlDecodeToString(payloadEncoded));

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired.');
  }

  return payload;
}

/**
 * Decodes a token's payload WITHOUT verifying the signature — matches what
 * the `jwt-decode` npm package does. Fine for reading claims to show in the
 * UI, but never trust this alone for security decisions (always verifyToken
 * before allowing a protected action).
 */
export function decodeToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token.');
  return JSON.parse(base64urlDecodeToString(parts[1]));
}
