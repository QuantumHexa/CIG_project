# API documentation

Base URL: `http://localhost:4000/api`

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register (body: email, password, name) |
| POST | `/auth/login` | Login → `{ token, user }` |
| GET | `/auth/me` | Current user (Bearer token) |

## Events

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events?sort=&category=&search=` | List events |
| GET | `/events/:id` | Event + albums |
| POST | `/events` | Create event (auth: admin/photographer/member) |
| POST | `/events/:id/albums` | Add album |
| PATCH | `/events/:id` | Update (admin/photographer) |
| DELETE | `/events/:id` | Delete (admin) |

## Media

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media/search?q=&tag=&uploader=&from=&to=` | Advanced search |
| GET | `/media/event/:eventId` | Event gallery |
| GET | `/media/:id` | Media detail + comments |
| POST | `/media/upload` | Multipart `files[]`, `eventId`, `isPublic` |
| GET | `/media/:id/download` | Watermarked download (auth) |
| POST | `/media/:id/like` | Like |
| DELETE | `/media/:id/like` | Unlike |
| POST | `/media/:id/comment` | `{ body }` |
| POST | `/media/:id/favorite` | Favorite |
| POST | `/media/:id/tag-user` | `{ userId }` |
| POST | `/media/face/selfie` | Multipart `selfie` |
| GET | `/media/face/my-photos` | Face-matched gallery |

## Notifications

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List for current user |
| PATCH | `/notifications/:id/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |

## Users

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users/search?q=` | Find users to tag |

## WebSocket

Connect to same host with `auth: { token: jwt }`.

Event: `notification` — payload is notification row.

## Health

`GET /api/health` → `{ status, s3 }`
