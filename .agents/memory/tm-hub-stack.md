---
name: TM Hub stack and architecture
description: Key technology choices and file layout for the TM Hub migration
---

**Stack:** pnpm workspaces, React+Vite+Tailwind v3 (postcss, NOT @tailwindcss/vite), Express 5, Drizzle/Postgres, Clerk auth, react-router-dom.

**Artifacts:**
- Frontend: `artifacts/tm-hub` (previewPath "/")  
- API: `artifacts/api-server` (port 5000/8080)

**Clerk:** App provisioned (appId: app_3EuYM3PavYyQNYjvOr0hGH56WJu). Keys auto-set as env vars. No cssLayerName for appearance config (Tailwind v3 compat). Use `useClerk` for signOut, not `useAuth`.

**12 DB tables:** assets, gear, productions, build_projects, projects, shots, call_sheets, script_breakdowns, project_assets, leads, staging_environments, project_resources.

**Why react-router-dom kept:** Original Lovable app used it heavily; migration preserved routing rather than switching to wouter.

**Gotcha:** react-day-picker v9 renamed IconLeft/IconRight → Chevron with orientation prop. calendar.tsx was fixed accordingly.
