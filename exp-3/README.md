# Role-Based JWT Authentication — Frontend-Only Version

This is a **backend-free** version of the JWT role-based auth experiment.
There is no Node/Express server — everything (mock login, password hashing,
JWT signing, JWT verification, and role-based CRUD permissions) happens
inside a single React app, running entirely in your browser.

This matches the experiment's own procedure line: *"Generate **or simulate**
JWT token."* Here, the token is genuinely generated and verified using the
browser's built-in Web Crypto API (HMAC-SHA256) — it's real cryptography,
just running client-side instead of on a server.

## ⚠️ Important note (say this in your viva if asked)

In a real production app, JWT signing **must** happen on a trusted server,
because the signing secret has to stay private — anything shipped in
frontend JavaScript can be read by anyone via browser DevTools. This
project intentionally has no backend, so the "secret" lives in
`src/utils/jwt.js` just so the full sign → verify flow can be demonstrated
in one place. This is fine for learning, **never for production.**

## Role permissions

| Action        | Admin | Editor | Viewer |
|---------------|:-----:|:------:|:------:|
| View posts    |  ✅   |   ✅   |   ✅   |
| Create post   |  ✅   |   ❌   |   ❌   |
| Update post   |  ✅   |   ✅   |   ❌   |
| Delete post   |  ✅   |   ❌   |   ❌   |

## Demo accounts

| Username | Password     | Role   |
|----------|--------------|--------|
| admin    | Admin@123    | admin  |
| editor   | Editor@123   | editor |
| viewer   | Viewer@123   | viewer |

Click a demo credential row on the login page to autofill it.

## Project structure

```
jwt-role-auth-frontend-only/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # login form; calls AuthContext.login() directly
│   │   ├── Dashboard.jsx       # topbar + "Inspect JWT" toggle + PostList
│   │   ├── PostList.jsx        # CRUD UI, gated by authorizeAction()
│   │   └── TokenInspector.jsx  # visually decodes the current JWT (for demo/viva)
│   ├── context/
│   │   └── AuthContext.jsx     # does the "login" itself: bcrypt compare + jwt sign
│   ├── data/
│   │   ├── users.js            # mock user table with bcrypt-hashed passwords
│   │   └── posts.js            # posts "database", persisted to localStorage
│   ├── utils/
│   │   ├── jwt.js              # signToken/verifyToken/decodeToken using Web Crypto API
│   │   └── authGuard.js        # authorizeAction() — verifies token + checks role
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Prerequisites

- **Node.js** v18+ (only needed to run Vite's dev server — nothing else)
- **npm**

## Step-by-step: how to run this

Only **one** terminal is needed this time (no separate backend process).

### Step 1 — Unzip and open in VS Code

Extract the zip, then in VS Code: **File → Open Folder** → select
`jwt-role-auth-frontend-only`.

### Step 2 — Install and run

Open a terminal (`` Ctrl+` ``) and run:

```bash
npm install
npm run dev
```

You'll see:

```
  VITE v5.x.x  ready in ~400 ms
  ➜  Local:   http://localhost:5173/
```

### Step 3 — Open the app

Go to **http://localhost:5173**.

### Step 4 — Test each role

1. Click a demo credential row (or type it) → sign in as **admin** → you'll
   see "+ New Post" plus Edit/Delete on every post.
2. Log out, sign in as **editor** → no "+ New Post," but Edit is available;
   Delete is not.
3. Log out, sign in as **viewer** → posts are visible, no edit controls at
   all.

### Step 5 — Inspect the JWT (built into this version)

After logging in, click **"Inspect JWT"** in the top bar. You'll see:
- The raw token string (exactly what's saved in `localStorage`)
- The decoded Header
- The decoded Payload — this is where you can literally see `"role": "admin"`
  (or editor/viewer) change depending on who's logged in
- The Signature

You can also copy the raw token and paste it into https://jwt.io to see the
same decoding from an independent tool.

## How the pieces map to the experiment's conceptual flow

1. **User logs in with credentials** → `Login.jsx` calls `login(username, password)`.
2. **Server validates user** *(simulated)* → `AuthContext.jsx`'s `login()`
   looks up the user in `data/users.js` and checks the password with
   `bcrypt.compareSync()`.
3. **JWT token is generated** → `utils/jwt.js`'s `signToken()` builds a
   payload `{id, username, role, name}`, signs it with real HMAC-SHA256 via
   `crypto.subtle.sign()`, and returns a 3-part token string.
4. **Token is stored on client** → saved to `localStorage`.
5. **Token is sent with each request** *(simulated)* — since there's no
   network call anymore, this step becomes: every CRUD action first passes
   the token into `authorizeAction(token, action)`.
6. **Token is verified + role checked** → `utils/authGuard.js`'s
   `authorizeAction()` calls `verifyToken()` (checks the HMAC signature and
   expiry) then checks the decoded role against what's allowed for that
   action — throwing a 401 (bad/missing token) or 403 (wrong role) style
   error if not permitted.
7. **Decode token to extract user info** → `TokenInspector.jsx` and
   `AuthContext.jsx` both decode the payload to read `id/username/role/name`.

## What's genuinely "real" here vs. simplified

**Real:**
- Password hashing (bcrypt, same algorithm as the backend version)
- JWT signing and verification (actual HMAC-SHA256 via the browser's Web
  Crypto API — this is the same algorithm `jsonwebtoken` uses on Node)
- Tampering detection — if you manually edit the token string, verification
  will fail (try it: copy a token, change one character in the payload
  section, and it'll be rejected)
- Expiry checking — tokens expire after 1 hour, exactly like the backend version

**Simplified (because there's no server):**
- The "backend" (user lookup, password check, token signing) all runs in
  the same browser tab as the "frontend" — there's no untrusted-client /
  trusted-server boundary, so this isn't a real security system, just a
  demonstration of how the pieces fit together
- Posts are stored in `localStorage` instead of a real database — they
  persist across page refreshes but are specific to your browser only
- The secret key is visible in the JavaScript bundle (unavoidable without a
  server) — in the full-stack version, that key stayed private in `backend/.env`

## Troubleshooting

- **"Port 5173 already in use"** — close other running Vite projects, or
  change the port in `vite.config.js`.
- **Posts don't reset** — posts persist in `localStorage` under the key
  `jwt_demo_posts`. To reset to the original 2 seed posts, open DevTools →
  Console and run: `localStorage.removeItem('jwt_demo_posts'); location.reload();`
- **"npm: command not found"** — install Node.js from https://nodejs.org.
