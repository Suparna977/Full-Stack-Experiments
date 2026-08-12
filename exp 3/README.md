# Role-Based JWT Authentication — Social Media Post Manager

A complete implementation of the experiment "Design and implement a secure
authentication system using JWT for user login and session management,"
extended with **role-based access control** for three roles: **Admin**,
**Editor**, and **Viewer**.

- **Backend:** Node.js + Express + JWT (`jsonwebtoken`) + `bcryptjs` for password hashing
- **Frontend:** React (Vite) + `jwt-decode` for client-side token decoding

## Role permissions

| Action        | Admin | Editor | Viewer |
|---------------|:-----:|:------:|:------:|
| View posts    |  ✅   |   ✅   |   ✅   |
| Create post   |  ✅   |   ❌   |   ❌   |
| Update post   |  ✅   |   ✅   |   ❌   |
| Delete post   |  ✅   |   ❌   |   ❌   |

Permissions are enforced **on the backend** (the real security boundary,
via JWT + middleware) and **mirrored on the frontend** (so buttons a role
can't use aren't even shown).

## Demo accounts

| Username | Password     | Role   |
|----------|--------------|--------|
| admin    | Admin@123    | admin  |
| editor   | Editor@123   | editor |
| viewer   | Viewer@123   | viewer |

These are seeded in `backend/data/users.js` with bcrypt-hashed passwords.
The login page also shows these as clickable autofill buttons.

## Project structure

```
jwt-role-auth/
├── backend/
│   ├── data/
│   │   ├── users.js       # mock user "database" with hashed passwords
│   │   └── posts.js       # in-memory posts store
│   ├── middleware/
│   │   └── auth.js        # verifyToken + authorize(...roles) middleware
│   ├── routes/
│   │   ├── auth.js        # POST /api/auth/login, GET /api/auth/me
│   │   └── posts.js       # GET/POST/PUT/DELETE /api/posts
│   ├── .env                # PORT, JWT_SECRET, JWT_EXPIRES_IN
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── PostList.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # stores token, decodes user, persists to localStorage
    │   ├── api.js          # fetch wrapper that attaches the JWT
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- **Node.js** v18 or later (v20+ recommended) — check with `node --version`
- **npm** (comes with Node.js) — check with `npm --version`

If you don't have Node.js installed, download it from https://nodejs.org.

---

## Step-by-step: how to run this project

You'll run **two things at once**: the backend API server (port 5000) and
the frontend React app (port 5173). Use two separate terminal windows/tabs.

### Step 1 — Unzip the project

Extract `jwt-role-auth.zip` anywhere on your computer, e.g. your Desktop.
You should see the `backend/` and `frontend/` folders.

### Step 2 — Start the backend

In your **first terminal**:

```bash
cd jwt-role-auth/backend
npm install
npm start
```

You should see:

```
Server running on http://localhost:5000
```

Leave this terminal running. The `.env` file already contains a
`JWT_SECRET` and a token expiry of `1h` — you can change these if you like.

**Quick sanity check (optional):** open http://localhost:5000/ in your
browser — you should see `{"message":"JWT Role-Based Auth API is running."}`.

### Step 3 — Start the frontend

In a **second terminal** (keep the backend running in the first one):

```bash
cd jwt-role-auth/frontend
npm install
npm run dev
```

You should see Vite print something like:

```
  VITE v5.x.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

### Step 4 — Open the app

Open **http://localhost:5173** in your browser. You'll see the login page.

### Step 5 — Test each role

1. Click one of the demo credential rows (or type them in manually) and
   sign in as **admin** → you should see "+ New Post" plus Edit/Delete
   buttons on every post.
2. Log out, sign in as **editor** → no "+ New Post" button, but Edit is
   available; Delete is not.
3. Log out, sign in as **viewer** → posts are visible but there are no
   Edit/Delete/New Post controls at all.
4. To see the backend enforcing this (not just hiding buttons), open your
   browser DevTools → Network tab while logged in as viewer, and try
   calling the create/delete endpoints directly — the backend responds
   `403 Forbidden`, because the check happens server-side using the role
   inside the verified JWT, not just in the UI.

### Step 6 — Inspect the JWT (optional, ties back to the theory)

1. After logging in, open DevTools → Application (Chrome) or Storage
   (Firefox) → Local Storage → `http://localhost:5173`.
2. You'll see a key `jwt_token` with a long string like
   `eyJhbGciOi...`.
3. Copy it and paste it into https://jwt.io to see the decoded Header,
   Payload (`id`, `username`, `role`, `name`, `iat`, `exp`), and Signature —
   exactly matching the three-part structure described in the theory.

---

## API reference (for the lab record / viva)

| Method | Endpoint             | Auth required | Roles allowed         | Description                     |
|--------|-----------------------|:--------------:|------------------------|----------------------------------|
| POST   | `/api/auth/login`     | No             | —                       | Validates credentials, returns JWT |
| GET    | `/api/auth/me`        | Yes            | any                     | Returns the decoded token's user info |
| GET    | `/api/posts`          | Yes            | admin, editor, viewer   | List all posts                  |
| GET    | `/api/posts/:id`      | Yes            | admin, editor, viewer   | Get a single post               |
| POST   | `/api/posts`          | Yes            | admin                   | Create a post                   |
| PUT    | `/api/posts/:id`      | Yes            | admin, editor           | Update a post                   |
| DELETE | `/api/posts/:id`      | Yes            | admin                   | Delete a post                   |

Authenticated requests must include:
```
Authorization: Bearer <token>
```

## How the pieces map to the experiment's conceptual flow

1. **User logs in with credentials** → `Login.jsx` submits to `POST /api/auth/login`.
2. **Server validates user** → `routes/auth.js` looks up the user and
   compares the password with `bcrypt.compare()` against the stored hash.
3. **JWT token is generated** → `jwt.sign({ id, username, role, name }, JWT_SECRET, { expiresIn })`.
4. **Token is stored on client** → `AuthContext.jsx` saves it to `localStorage`.
5. **Token is sent with each request** → `api.js` attaches
   `Authorization: Bearer <token>` to every API call.
6. **Server verifies token + role on each request** → `middleware/auth.js`'s
   `verifyToken` checks the signature/expiry, and `authorize(...roles)`
   checks the role claim before letting the request through — this is the
   stateless session/authorization mechanism.
7. **Decode token to extract user info** → `jwt-decode` on the frontend
   pulls `id/username/role/name` straight out of the token for display,
   with no extra server round-trip needed.

## Notes on security (useful talking points for the viva)

- Passwords are never stored or compared in plaintext — `bcryptjs` hashes
  them with a salt (`bcrypt.hashSync(password, 10)`).
- The JWT payload intentionally excludes sensitive data (like the password
  hash) — JWTs are signed, not encrypted, so anyone can decode and read the
  payload (try it on jwt.io). Never put secrets inside a JWT payload.
- Authorization is enforced **server-side** via the `authorize()`
  middleware. The frontend hiding buttons is only a UX nicety — a
  determined user could call the API directly, which is why the 403 checks
  in Step 5.4 above matter.
- Tokens expire after 1 hour (`JWT_EXPIRES_IN` in `backend/.env`); an
  expired token is rejected with `401 Token expired. Please log in again.`
  and the frontend automatically logs the user out when this happens.
- This demo uses `localStorage` for simplicity (matching the experiment's
  procedure). In production apps, httpOnly cookies are generally preferred
  over `localStorage` for token storage, since `localStorage` is
  readable by any JavaScript running on the page (XSS risk).

## Troubleshooting

- **"Port 5000 already in use"** — another process is using that port.
  Stop it, or change `PORT` in `backend/.env` and update `BASE_URL` in
  `frontend/src/api.js` to match.
- **Frontend shows network errors / can't reach API** — make sure the
  backend terminal is still running and shows
  `Server running on http://localhost:5000`.
- **"npm: command not found"** — install Node.js from https://nodejs.org,
  then reopen your terminal.
- **Login says "Invalid username or password"** — double-check you're
  using the exact demo credentials above (case-sensitive).
