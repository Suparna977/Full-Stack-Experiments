// This is the frontend-only stand-in for what `backend/middleware/auth.js`
// did in the full-stack version: verify the token is genuine (not just
// trust React state), then check the role inside it against what's allowed
// for the requested action.
//
// In the full-stack version this ran on the server and was the real
// security boundary. Here, since everything runs in one browser tab with
// no separate trusted server, this is a DEMONSTRATION of the verify-then-
// authorize pattern, not a real security boundary — a user could still
// tamper with things via devtools since there's no untrusted-client /
// trusted-server split. This distinction is worth stating explicitly in
// your viva if asked.

import { verifyToken } from './jwt.js';

const PERMISSIONS = {
  admin: { view: true, create: true, update: true, delete: true },
  editor: { view: true, create: false, update: true, delete: false },
  viewer: { view: true, create: false, update: false, delete: false },
};

/**
 * Verifies the token, then checks whether the resulting role is permitted
 * to perform the given action. Throws a descriptive error if not — mirrors
 * a 401 (bad token) vs 403 (wrong role) distinction from the backend version.
 */
export async function authorizeAction(token, action) {
  if (!token) {
    const err = new Error('Not authenticated. Please log in.');
    err.status = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = await verifyToken(token);
  } catch (e) {
    const err = new Error(e.message.includes('expired') ? 'Session expired. Please log in again.' : 'Invalid session token.');
    err.status = 401;
    throw err;
  }

  const perms = PERMISSIONS[decoded.role];
  if (!perms || !perms[action]) {
    const err = new Error(`Access denied. Role '${decoded.role}' cannot '${action}' posts.`);
    err.status = 403;
    throw err;
  }

  return decoded; // verified user info, safe to use
}

export { PERMISSIONS };
