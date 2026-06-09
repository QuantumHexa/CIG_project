# EventLens — Event & Media Management Platform

Centralized platform for clubs and photographers to upload, organize, search, and share event photos and videos — aligned with the **CIG Dev Problem Statement**.

## Features (PS coverage)

| Area | Implementation |
|------|----------------|
| **Event management** | CRUD, albums, metadata, sort by name/date/category |
| **Media upload** | Bulk, drag-and-drop, preview, Sharp compression |
| **Auth & roles** | JWT — Admin, Photographer, Club Member, Viewer; public/private media |
| **Social** | Like, comment, favorite, tag users, download, share via URLs |
| **Notifications** | Socket.io real-time (like, comment, tag) |
| **AI tagging** | Category + color heuristics; optional Hugging Face BLIP (`HF_API_TOKEN`) |
| **Search** | Event, tags, date range, uploader, keyword |
| **Face recognition** | Reference selfie + visual embedding match (Sharp-based, cross-platform) |
| **Cloud** | AWS S3 (production); local `uploads/` fallback for dev |
| **Watermark** | Dynamic text: club, event, user role on download |
| **Bonus** | Infinite scroll gallery, PWA manifest, QR share endpoint |

## Quick start

### Prerequisites

- Node.js 20+
- Docker (PostgreSQL for local dev) or [Neon](https://neon.tech) free DB
- Optional: AWS credentials, `HF_API_TOKEN` for richer AI tags

### Setup

```bash
# 1. Environment
copy .env.example .env

# 2. Database & install
docker compose up -d
copy .env.example backend\.env
npm run install:all
npm run db:push --prefix backend
npm run db:seed --prefix backend

# 3. Run (two terminals)
npm run dev:backend
npm run dev:frontend
```

- **Frontend:** http://localhost:5173  
- **API:** http://localhost:4000  

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@cig.dev | password123 | ADMIN |
| photo@cig.dev | password123 | PHOTOGRAPHER |
| member@cig.dev | password123 | CLUB_MEMBER |

## Project structure

```
├── backend/          Express + Prisma + PostgreSQL
├── frontend/         React + Vite + Tailwind
├── docs/             Architecture, DB schema, API
├── docker-compose.yml
└── .env.example
```

## Deliverables checklist

- [x] GitHub-ready repository structure
- [x] README + setup instructions
- [x] Database schema (`docs/DATABASE_SCHEMA.md` + Prisma)
- [x] Architecture diagram (`docs/ARCHITECTURE.md`)
- [x] API overview (`docs/API.md`)
- [ ] Deploy demo — see **[docs/DEPLOY.md](docs/DEPLOY.md)** (Render + Vercel)
- [x] Presentation (`docs/CIG_Project_Presentation.pptx`)
- [ ] Demo video (team)

## Deployment hints

1. **PostgreSQL:** Neon, Supabase, or Railway  
2. **API:** Render/Railway with `DATABASE_URL`, `JWT_SECRET`, S3 vars  
3. **Frontend:** Vercel/Netlify with `VITE_API_URL` or reverse proxy  
4. Run `prisma db push` and `npm run db:seed` on first deploy  

## Evaluation alignment

| Criteria | Weight | How we address it |
|----------|--------|-------------------|
| UI/UX | 15% | Modern responsive UI, drag-drop upload, gallery |
| Backend & APIs | 15% | REST modules, Prisma, typed services |
| Auth & access | 10% | JWT + role-based private media |
| Cloud | 15% | S3 integration with signed URLs |
| Media features | 15% | Events, albums, bulk upload, social actions |
| AI/ML | 15% | Auto tags + face match pipeline |
| Real-time | 5% | Socket.io notifications |
| Code quality | 5% | TypeScript, modular services |
| Innovation | 5% | PWA, infinite scroll, QR share |

## Submitting for CIG Dev

See **[docs/SUBMISSION.md](docs/SUBMISSION.md)** for the full checklist from the problem statement.

**Mandatory deliverables:**

1. GitHub repo (this project)
2. Live deployed demo
3. README + DB schema + architecture diagram (in `docs/`)
4. PPT presentation (your team)
5. Demo video (your team)

**Repository:** https://github.com/QuantumHexa/CIG_project

```powershell
cd "d:\CIG project"
git remote add origin https://github.com/QuantumHexa/CIG_project.git
git push -u origin main
```

## License

MIT — for academic / competition submission.
