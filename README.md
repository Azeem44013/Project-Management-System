# ProjectHub

ProjectHub is a project and task management system built with React, TypeScript, Vite, Express, and Supabase. It includes email/password authentication, project tracking, task management, filtering, progress reporting, and owner-scoped database security.

## Links

- Production: https://vite-react-typescript-starter-3-murex.vercel.app
- GitHub: https://github.com/Azeem44013/Project-Management-System
- API reference: [docs/API.md](docs/API.md)
- Database schema and ER diagram: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- Deployment guide: [DEPLOY.md](DEPLOY.md)

## Features

- Supabase email/password sign-up, sign-in, and sign-out
- Dashboard statistics and task completion progress
- Create, edit, delete, and view projects
- Create, edit, delete, filter, and update tasks
- Project-level task organization
- Row Level Security policies for per-user data isolation
- Responsive React interface with Tailwind CSS
- Local Express API and production Vercel serverless API

## Architecture

```text
React + Vite frontend
		  |
		  | local: http://localhost:3000
		  | production: /api?path=...
		  v
Express API or Vercel Function
		  |
		  | Supabase client with user's bearer token
		  v
Supabase Auth + PostgreSQL + Row Level Security
```

The browser handles authentication with Supabase. CRUD requests send the current Supabase access token to the API. The API forwards that token to Supabase so database policies continue to restrict records to the authenticated user.

## Project Structure

```text
src/                    React application
  components/           Layout and reusable UI components
  context/              Authentication provider and hook
  lib/api.ts            Typed frontend API client
  pages/                Auth, dashboard, projects, and project detail views
server/                 Local Express API
api/index.js            Vercel production serverless API
supabase/migrations/    PostgreSQL schema, policies, and indexes
docs/                   API and database documentation
```

## Requirements

- Node.js 18+
- npm
- A Supabase project with email/password authentication enabled

## Local Setup

1. Install frontend dependencies:

	```bash
	npm install
	```

2. Create `project/.env` with:

	```env
	VITE_SUPABASE_URL=https://your-project.supabase.co
	VITE_SUPABASE_ANON_KEY=your-anon-key
	VITE_API_URL=http://localhost:3000
	```

3. Apply the migration in [supabase/migrations/20260910095708_create_projects_and_tasks.sql](supabase/migrations/20260910095708_create_projects_and_tasks.sql).

4. Start the local API in a second terminal:

	```bash
	node server/index.js
	```

5. Start the frontend:

	```bash
	npm run dev
	```

Open http://localhost:5173.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
node --check server/index.js
node --check api/index.js
```

## Deployment

The frontend and production API are deployed together on Vercel. Configure these production environment variables in the Vercel project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

When `VITE_API_URL` is not set in a production build, the frontend uses the Vercel function at `/api?path=...`. For a separate Express deployment, set `VITE_API_URL` to that public backend URL instead.

See [DEPLOY.md](DEPLOY.md) for Vercel and Render deployment details.
