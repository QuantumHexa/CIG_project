# CIG Dev — Submission Checklist

Based on **CIG_DEV_PS.pdf** expected deliverables.

## Mandatory (submit all of these)

| # | Deliverable | Your project | Action |
|---|-------------|--------------|--------|
| 1 | **GitHub repository** | [QuantumHexa/CIG_project](https://github.com/QuantumHexa/CIG_project) | Share repo URL with judges ✓ |
| 2 | **Working deployed demo** | Local + deploy | Deploy API (Render/Railway) + frontend (Vercel); add live URLs to README |
| 3 | **README** | `README.md` | Setup, features, demo accounts, deploy links |
| 4 | **Database schema** | `docs/DATABASE_SCHEMA.md` + `backend/prisma/schema.prisma` | Include in repo ✓ |
| 5 | **Architecture diagram** | `docs/ARCHITECTURE.md` (Mermaid) | Export to PNG for PPT if needed |
| 6 | **Presentation / PPT** | Team creates | Cover problem, features, tech stack, demo flow, evaluation alignment |
| 7 | **Demo video** | Team records | 5–10 min walkthrough: login → event → upload → search → face match → download |

## Optional (extra marks)

- API docs → `docs/API.md` ✓
- Docker → `docker-compose.yml` ✓
- CI/CD → add GitHub Actions later

## How judges score (100%)

| Criteria | Weight | Highlight in PPT/demo |
|----------|--------|------------------------|
| UI/UX and Design | 15% | Modern UI, drag-drop upload |
| Backend & APIs | 15% | REST modules, Prisma |
| Auth & access control | 10% | Roles, public/private media |
| Cloud integration | 15% | AWS S3 (configure in production) |
| Media management | 15% | Events, albums, bulk upload |
| AI/ML | 15% | Auto tags, search, face match |
| Real-time notifications | 5% | Socket.io likes/comments/tags |
| Code quality | 5% | TypeScript, structure |
| Innovation / bonus | 5% | PWA, infinite scroll, QR share |

## Suggested submission package

1. **GitHub URL** (public repo)
2. **Live demo URL** (frontend) + **API URL**
3. **PPT/PDF** (upload to drive or attach per organizer instructions)
4. **Demo video link** (YouTube unlisted or Drive)
5. **Team details** (as required by CIG portal)

## Quick deploy (after GitHub push)

1. **Database:** Neon/Supabase PostgreSQL (or keep SQLite for small demo)
2. **Backend:** Render → set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, optional AWS keys
3. **Frontend:** Vercel → root `frontend/`, env `VITE_API_URL` or proxy to API
4. Update README with production URLs before final submission

## Demo script for video

1. Sign in as `photo@cig.dev`
2. Open Events → Cultural Fest
3. Upload 2–3 photos (drag-drop)
4. Show AI tags on gallery
5. Search by tag
6. Like + comment → show notification
7. My Photos → upload selfie → find matches
8. Download with watermark
