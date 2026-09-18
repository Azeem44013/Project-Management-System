Deployment guide
----------------

This repo contains a Vite + React frontend in `project/` and a small Express server in `project/server`.

Quick local run

```powershell
# server
cd project/server
Copy-Item .env.example .env
# set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
npm ci
npm run dev

# frontend
cd ..\
cd project
npm ci
npm run dev
```

GitHub Actions (CI/CD)

- The workflow at `.github/workflows/ci-cd-deploy.yml` builds the frontend and then:
  - deploys the frontend to Vercel using `npx vercel` and the `VERCEL_TOKEN` secret.
  - triggers a Render deployment by POSTing to the Render API using `RENDER_API_KEY` and `RENDER_SERVICE_ID` secrets.

Set these repository secrets in GitHub: `VERCEL_TOKEN`, `RENDER_API_KEY`, `RENDER_SERVICE_ID`.

Vercel

- Add a Vercel project connected to this repo (or let the action deploy directly). Set `VITE_API_URL` in Vercel to your backend URL.

Render

- Use the `render.yaml` manifest as a starting point, or create two services in Render:
  - `project-bolt-server` (Node web service) — set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` as environment variables.
  - `project-bolt-frontend` (Static site) — set `VITE_API_URL` to the backend URL.

Notes

- The Actions workflow expects `main` branch deploys. Adjust as needed.
- For secure deployment, provide the required secrets in your GitHub repository settings.
