PR: Trigger CI/CD workflow (Vercel + Render)
===========================================

This file contains commands and a suggested PR body to create a branch, add a commit, push it, and open a PR that will trigger the GitHub Actions workflow `.github/workflows/ci-cd-deploy.yml`.

1) Create a branch and add a tiny commit (locally):

```bash
git checkout -b ci/cd-test-deploy
# optional: make changes or leave as-is
echo "Trigger CI/CD: $(date -u)" > tmp/ci-trigger.txt
git add tmp/ci-trigger.txt
git commit -m "chore(ci): trigger CI/CD workflow for deploy test"
git push --set-upstream origin ci/cd-test-deploy
```

2) Set required GitHub repository secrets (in Settings → Secrets → Actions):

- `VERCEL_TOKEN` — personal token from Vercel (for frontend deploy)
- `RENDER_API_KEY` — API key from Render
- `RENDER_SERVICE_ID` — Render service id to trigger deploy

3) Open a Pull Request from `ci/cd-test-deploy` → `main` in GitHub UI. The workflow runs on `push` to `main` by default; you can adjust `on:` in the workflow if you prefer PRs.

Suggested PR title: "chore(ci): test CI/CD deploy"

Suggested PR body:

```
This PR triggers the CI/CD pipeline to validate the Vercel frontend deployment and Render server trigger.

- Builds the frontend in `project/`
- Deploys frontend to Vercel (via `npx vercel`)
- Triggers a Render deploy for the server service (if `RENDER_*` secrets set)

Secrets required: `VERCEL_TOKEN`, `RENDER_API_KEY`, `RENDER_SERVICE_ID`.
```

Notes:
- If you want the workflow to run on PRs instead of pushes to `main`, change the `on:` section in `.github/workflows/ci-cd-deploy.yml` to include `pull_request`.
- If you want me to create the branch and open a PR, I can prepare the commit content here; you will need to `git push` it from your environment or grant repo access.
