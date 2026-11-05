# WorkSphere

Employee management system: React + Vite + Redux Toolkit (RTK Query) frontend, Express + MongoDB backend, JWT auth.

## Local development

```bash
# backend
cd backend && cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install && npm run dev            # http://localhost:5000

# frontend (new terminal, repo root)
cp .env.example .env
npm install && npm run dev            # http://localhost:5173
```

## How auth works
1. `POST /api/auth/login` returns a signed JWT (HS256, `JWT_EXPIRES_IN`, default 1d).
2. The frontend stores it in the Redux `auth` slice (persisted to localStorage) and `apiSlice` sends it as `Authorization: Bearer <token>`.
3. The backend `protect` middleware verifies it; `authorizeRoles` enforces Admin / HR / Employee access.
4. On any 401 the frontend logs out automatically and clears the RTK Query cache.

## Redux structure (`src/redux`)
| File | Role |
|---|---|
| `store.js` | `configureStore` + listener middleware (persists session/settings, clears the API cache on logout, syncs logout across tabs) |
| `authSlice.js` | `auth` state (`user`, `token`) – pure reducers, selectors |
| `settingsSlice.js` | notification preferences |
| `persist.js` | safe localStorage helpers and initial-state loaders |
| `apiSlice.js` | RTK Query base API (auth header, auto-logout on 401, cache tags) |
| `authApi.js` | `login`, `register`, `getMe` (validates the stored token on app load) |
| `workforceApi.js` | endpoints for employees, departments, attendance, leaves, payroll, performance, finance, holidays |

All server data goes through RTK Query; no page reads or writes business data in localStorage.

## Third-party API
Public holidays come from [Nager.Date](https://date.nager.at) (no key needed). The browser calls `GET /api/external/holidays`, and the backend fetches and caches the provider response for 24h.

## Deploying to Vercel (step by step)

WorkSphere deploys as **two Vercel projects** from one GitHub repo: the API (`backend/`) and the React app (repo root).

### 0. MongoDB Atlas
1. Create a free **M0** cluster at cloud.mongodb.com.
2. *Database Access* -> add a database user (username + password; avoid `@ : / ?` in the password or URL-encode it).
3. *Network Access* -> add IP `0.0.0.0/0` (Vercel has no fixed IPs).
4. *Connect -> Drivers* -> copy the `mongodb+srv://...` string, and put the database name before the `?`:
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/worksphere?retryWrites=true&w=majority`

### 1. Push to GitHub
`backend/.env` and `.env` are git-ignored. Never commit real secrets.

### 2. Backend project
Vercel -> *Add New Project* -> import the repo -> **Root Directory = `backend`** (Framework: Other). Environment variables:

| Name | Value |
|---|---|
| `MONGO_URI` | the Atlas string from step 0 |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `1d` |
| `CLIENT_ORIGINS` | frontend URL from step 3 (add after step 3, then redeploy) |

Deploy, then open `https://<backend>.vercel.app/api/health` - you should see `{"status":"ok"}`.

### 3. Frontend project
Add another project from the same repo, **Root Directory = `.`** (Framework: Vite). Environment variable:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://<backend>.vercel.app/api` |

`VITE_*` values are baked in at build time, so redeploy after changing them. Go back to the backend project, set `CLIENT_ORIGINS` to the frontend URL (no trailing slash; comma-separate extra origins), and redeploy it.

### 4. Create the first admin
From your machine, with `backend/.env` pointing at the Atlas database and `ADMIN_EMAIL` / `ADMIN_PASSWORD` (12+ chars) set:

```bash
cd backend && npm install && npm run create-admin
```

Then sign in on the deployed site. Admins add employees; employees register using their employee ID and the email on their record.

### Troubleshooting
- **CORS error / 403 "Not allowed by CORS"** - `CLIENT_ORIGINS` doesn't exactly match the frontend URL.
- **500 "Database connection failed"** - wrong `MONGO_URI`, or Atlas Network Access doesn't allow `0.0.0.0/0`.
- **Frontend calls `/api` on its own domain** - `VITE_API_URL` wasn't set before the build; set it and redeploy.
- **Page refresh gives 404** - fixed by the rewrite in the root `vercel.json`.
