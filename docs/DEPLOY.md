# Deploy EventLens (CIG Project)

## Architecture

| Component | Platform | Free tier |
|-----------|----------|-----------|
| Frontend | [Vercel](https://vercel.com) | Yes |
| API + WebSocket | [Render](https://render.com) | Yes |
| Database | Render PostgreSQL | Yes |

## Step 1 — Deploy backend (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. **New → Blueprint** → connect `QuantumHexa/CIG_project`
3. Render reads `render.yaml` and creates:
   - PostgreSQL database `cig-db`
   - Web service `cig-api`
4. After create, set **Environment** on `cig-api`:
   - `CLIENT_URL` = your Vercel URL (e.g. `https://cig-project.vercel.app`)
5. Wait for deploy (~5–10 min on free tier)
6. Copy API URL: `https://cig-api.onrender.com` (name may vary)
7. Test: `https://YOUR-API.onrender.com/api/health`

## Step 2 — Deploy frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → **Add New Project**
2. Import `QuantumHexa/CIG_project`
3. Set **Root Directory** = `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com` (no trailing slash)
5. Deploy
6. Copy frontend URL and **update Render** `CLIENT_URL` to match (then redeploy API if CORS errors)

## Step 3 — Verify

- Open Vercel URL → Sign in `admin@cig.dev` / `password123`
- Create event, upload photos, search, notifications

## Demo accounts (auto-seeded on Render build)

| Email | Password |
|-------|----------|
| admin@cig.dev | password123 |
| photo@cig.dev | password123 |
| member@cig.dev | password123 |

## Optional — AWS S3 (production uploads)

Render free tier disk is ephemeral. For persistent media, set on Render:

```
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket
```

## Local development (PostgreSQL)

```bash
docker compose up -d
# .env: DATABASE_URL=postgresql://cig:cig_secret@localhost:5432/event_media
cd backend && npx prisma db push && npm run db:seed
```

Or use [Neon](https://neon.tech) free PostgreSQL and paste connection string into `DATABASE_URL`.
