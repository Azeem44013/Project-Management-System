# API Documentation

ProjectHub exposes the same project/task contract through the local Express server and the production Vercel function.

## Authentication

Every project/task request requires a Supabase access token:

```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

Unauthenticated requests return `401`.

## Base URLs

| Environment | Base URL | Example |
|---|---|---|
| Local Express | `http://localhost:3000` | `GET /projects` |
| Vercel function | `/api` | `GET /api/projects` |

The frontend client selects the local URL from `VITE_API_URL`. When that variable is absent, it uses the Vercel function.

## Projects

| Method | Local endpoint | Vercel request path | Response |
|---|---|---|---|
| GET | `/api/projects` | `/api/projects` | `200 Project[]` |
| GET | `/api/projects/:id` | `/api/projects/:id` | `200 Project` or `404` |
| POST | `/api/projects` | `/api/projects` | `201 Project` |
| PUT | `/api/projects/:id` | `/api/projects/:id` | `200 Project` |
| DELETE | `/api/projects/:id` | `/api/projects/:id` | `204` |

## Authentication

| Method | Endpoint | Response |
|---|---|---|
| POST | `/api/auth/register` | `201` auth data |
| POST | `/api/auth/login` | `200` session and user |
| POST | `/api/auth/logout` | `204` |

Registration and login accept `{ "email": "...", "password": "...", "fullName": "..." }`. Logout requires the bearer token.

Example project payload:

```json
{
  "name": "Website redesign",
  "description": "Refresh the customer portal",
  "status": "in_progress",
  "start_date": "2026-09-22",
  "end_date": "2026-10-15"
}
```

Valid project statuses: `not_started`, `in_progress`, `completed`.

## Tasks

| Method | Local endpoint | Vercel request path | Response |
|---|---|---|---|
| GET | `/api/tasks` | `/api/tasks` | `200 Task[]` with project data |
| GET | `/api/tasks/:id` | `/api/tasks/:id` | `200 Task` or `404` |
| GET | `/api/projects/:id/tasks` | `/api/projects/:id/tasks` | `200 Task[]` |
| POST | `/api/tasks` | `/api/tasks` | `201 Task` |
| PUT | `/api/tasks/:id` | `/api/tasks/:id` | `200 Task` |
| DELETE | `/api/tasks/:id` | `/api/tasks/:id` | `204` |

Example task payload:

```json
{
  "name": "Create wireframes",
  "description": "Prepare desktop and mobile layouts",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-09-30",
  "project_id": "project-uuid"
}
```

Valid priorities: `low`, `medium`, `high`.

Valid task statuses: `pending`, `in_progress`, `completed`.

## Errors

Errors use this shape:

```json
{
  "error": "Human-readable error message"
}
```

Common statuses:

- `401`: missing authentication token
- `404`: project, task, or endpoint not found
- `500`: Supabase configuration or database error
