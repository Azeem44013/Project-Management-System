# ProjectBolt Server

Simple Express server that proxies CRUD for `projects` and `tasks` to Supabase.

Setup:

1. Copy `.env.example` to `.env` and fill `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
2. Install dependencies:

```bash
cd server
npm install
```

3. Run in dev:

```bash
npm run dev
```

Endpoints:
- `GET /health`
- `GET /projects`
- `GET /projects/:id`
- `GET /tasks`
- `GET /projects/:id/tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
