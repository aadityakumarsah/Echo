> # Clario — Frontend
> 
> Web client for **Clario**, a voice-first reflection app. The UI is built with React and Vite, talks to a **FastAPI** backend for sessions/settings, **Supabase** for auth, and a Gemini WebSocket path for live voice journaling.
> 
> ## Prerequisites
> 
> - [Bun](https://bun.sh) (recommended — this repo uses `bun.lock`) **or** Node 18+ with npm
> - Running **Clario backend** (default `http://localhost:8000`) and configured **Supabase** project
> 
> ## Quick start
> 
> ```bash
> cd clario-frontend
> cp .env.example .env
> # Edit .env with your Supabase URL, publishable key, and backend URL
> 
> bun install
> bun run dev
> ```
> 
> The dev server listens on **http://localhost:8080** (see `vite.config.ts`).
> 
> ## Environment variables
> 
> Copy `.env.example` to `.env` and set:
> 
> | Variable | Purpose |
> | -------- | ------- |
> | `VITE_SUPABASE_URL` | Supabase project URL |
> | `VITE_SUPABASE_PUBLISHABLE_KEY` | publishable key (client-safe) |
> | `VITE_BACKEND_BASE_URL` | API + WebSocket base (e.g. `http://localhost:8000`) |
> 
> Never commit real keys; keep secrets in `.env` (gitignored).
> 
> ## Scripts
> 
> | Command | Description |
> | ------- | ----------- |
> | `bun run dev` | Start Vite dev server with HMR |
> | `bun run build` | Production build to `dist/` |
> | `bun run preview` | Serve the production build locally |
> | `bun run lint` | ESLint |
> | `bun run test` | Vitest (single run) |
> | `bun run test:watch` | Vitest watch mode |
> 
> ## Tech stack
> 
> - **React 18** + **TypeScript**
> - **Vite** (React SWC plugin)
> - **React Router** — app routes and protected areas
> - **TanStack Query** — server state (e.g. settings)
> - **Tailwind CSS** + **shadcn/ui**-style Radix components
> - **Framer Motion** — page and UI motion
> - **i18next** / **react-i18next** — English and Nepali (`src/i18n.ts`)
> - **Supabase JS** — session tokens for API calls
> - **Recharts** — dashboard charts
> 
> ## Project layout (high level)
> 
> - `src/App.tsx` — providers, router, route table
> - `src/pages/` — route-level screens (landing, login, dashboard, journal calendar, settings, …)
> - `src/components/` — shared UI, layout, modals
> - `src/contexts/` — Supabase-backed auth
> - `src/hooks/` — theme, voice journal, etc.
> - `src/lib/` — API client (`api.ts`), Supabase, session/report helpers
> - `public/` — static assets (favicon, audio worklet scripts, etc.)
> 
> ## API integration
> 
> Authenticated requests attach `Authorization: Bearer <Supabase access_token>` from `src/lib/api.ts`. Ensure the backend validates that JWT and matches your Supabase project.
> 
> ## License / ownership
> 
> Part of the Clario monorepo; see the repository root for overall licensing and contribution guidelines if present.
