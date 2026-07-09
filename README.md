# 🏋️ Gym Tracker

A personal workout tracker for **running, rope jumping, tennis**, strength training,
daily habits, interval timing, and goals — with cross-device sync and charts.

Built with **Vite + React + TypeScript**, **Tailwind CSS** (dark-mode default,
mobile-first), **Zustand** (timer & live-run engine), **TanStack Query + Supabase**
(Postgres, Auth, Storage), **Recharts**, and **react-leaflet** for GPS maps.

> The previous single-file version is preserved at [`legacy/index.html`](legacy/index.html).

## Features

- **Dashboard** — cross-activity stats and trends.
- **Checklist** — daily habits with streaks and a 7-day grid.
- **Timer** — interval/HIIT timer with SVG ring, voice cues, beeps, and saved presets.
- **Weights** — exercise → session → sets logging with a progression chart.
- **Running** — live GPS tracking (map, pace, calories, splits), GPX import, elevation chart, photos.
- **Rope jumping** & **Tennis** — dedicated session logging.
- **Goals** — weekly consistency + custom targets.

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the contents of [`supabase/schema.sql`](supabase/schema.sql)
   (creates all tables, Row-Level Security policies, and the `run-photos` storage bucket).
3. In **Project Settings → API**, copy the **Project URL** and **anon public** key.

### 3. Configure env

```bash
cp .env.example .env.local
# then edit .env.local:
#   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
#   VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

The anon key is safe to ship in a client app — access is enforced by RLS.

### 4. Run

```bash
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
```

Sign in with a magic link (Supabase Auth → email). GPS tracking requires HTTPS or `localhost`.

## Deploy to GitHub Pages

1. Push this repo to GitHub (repo name `gym`, so the site serves at
   `https://<user>.github.io/gym/`). If your repo has a different name, change
   `VITE_BASE` in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) to `/<repo>/`.
2. In **Settings → Secrets and variables → Actions**, add repository secrets
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. In **Settings → Pages**, set **Source: GitHub Actions**.
4. Push to `main` — the workflow builds and deploys automatically.
5. In Supabase **Authentication → URL Configuration**, add your Pages URL to the
   allowed redirect URLs so magic links work in production.

## Project structure

```
src/
  lib/        supabase client, auth, theme, types, utils
  store/      zustand: timerStore, liveRunStore
  data/       TanStack Query hooks per feature
  components/ shell, UI kit, charts
  features/   dashboard, checklist, timer, weights, goals, running, rope, tennis
supabase/schema.sql   tables + RLS + storage bucket
```
