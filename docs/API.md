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
| Vercel function | `/api?path=` | `GET /api?path=projects` |

The frontend client selects the local URL from `VITE_API_URL`. When that variable is absent, it uses the Vercel function.

## Projects

| Method | Local endpoint | Vercel request path | Response |
|---|---|---|---|
| GET | `/projects` | `projects` | `200 Project[]` |
| GET | `/projects/:id` | `projects/:id` | `200 Project` or `404` |
| POST | `/projects` | `projects` | `201 Project` |
| PUT | `/projects/:id` | `projects/:id` | `200 Project` |
| DELETE | `/projects/:id` | `projects/:id` | `204` |

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
| GET | `/tasks` | `tasks` | `200 Task[]` with project data |
| GET | `/projects/:id/tasks` | `projects/:id/tasks` | `200 Task[]` |
| POST | `/tasks` | `tasks` | `201 Task` |
| PUT | `/tasks/:id` | `tasks/:id` | `200 Task` |
| DELETE | `/tasks/:id` | `tasks/:id` | `204` |

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
