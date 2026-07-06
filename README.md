# UV Index — Utility Solar Project Tracker

Track construction progress, quality control inspections, and safety incidents
across multiple utility-scale solar sites, with role-based access for your team.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres database, authentication, row-level security

## Features

- Email/password auth. The **first person to sign up becomes Admin** automatically; everyone after is a Standard User.
- **Admin vs Standard User** roles: both can create/edit sites, tasks, QC inspections, and incidents. Only Admins can delete records.
- **Sites**: name, location, capacity (MW), status, target completion date.
- **Progress tracking**: tasks per site with status and % complete, grouped by the same Flow → Stage taxonomy as QAQC (e.g. Foundations → Piles, Rows → Finish Racking), so progress and quality checks line up against the same structure. Each Flow section shows a rolled-up progress bar; each Stage groups its tasks underneath.
- **Quality control**: logged inspections per site (pass / fail / N/A) with category and notes.
- **Safety incidents**: logged per site with severity (near miss → critical) and status (open → closed), plus a cross-site incident feed.
- **Photo capture with geolocation**: attaching a photo to a QC inspection or incident report grabs the device's GPS location at that moment (via the browser Geolocation API — the user's browser will prompt for permission). Photos upload to Supabase Storage; each site has a **Map** tab plotting every geotagged QC check and incident.
- **Lessons learned**: a per-site log for capturing what went well and what to improve, with a category, description, and a recommendation for future projects. Supports the same photo + geolocation capture.
- **QAQC signoffs**: a structured checklist system seeded from a real construction QAQC template (Flow → Stage → checklist item, e.g. SWPPP → Silt Fencing → "Confirm silt fence is trenched in"). Field crews pick a Flow and Stage, tag the specific location (e.g. "Row 14" or "Pier B-12"), and check off every item as Pass / Fail / N/A, with notes on any failures. Every signoff is saved with full history, expandable to see every item's result.
- **Installable on iPhone**: the app is a Progressive Web App (PWA) — from Safari on iPhone, tap Share → "Add to Home Screen" to get a real icon that opens full-screen, no App Store needed.

## Setup

### 1. Create a Supabase project

Go to supabase.com, create a new project, and grab:
- Project URL
- `anon` public API key

(Settings → API in the Supabase dashboard.)

### 2. Run the database migrations

In the Supabase dashboard, open the **SQL Editor** and run, in order:
1. `supabase/migrations/0001_init.sql` — core tables, roles, RLS policies
2. `supabase/migrations/0002_photo_geolocation.sql` — lat/long columns and the `site-photos` storage bucket
3. `supabase/migrations/0003_lessons_learned.sql` — lessons learned table
4. `supabase/migrations/0004_qaqc_checklist.sql` — QAQC checklist template (seeded with 239 checklist items across 8 flows / 33 stages), signoffs, and signoff results
5. `supabase/migrations/0005_task_flow_stage.sql` — adds Flow/Stage columns to tasks, so Progress can be grouped the same way as QAQC

Alternatively, with the Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and anon key in `.env.local`.

### 4. Install and run

```bash
npm install
npm run dev
```

Visit http://localhost:3000. Sign up — your first account becomes Admin.

## Deployment

This app deploys cleanly to **Vercel**:

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel's project settings.
4. Deploy.

Any other Node-compatible host (Netlify, Railway, self-hosted) works too —
just set the same two environment variables.

## Extending

- **More roles** (e.g. Field Crew, Safety Officer, PM): add values to the `user_role` enum in a new migration, and extend the RLS policies / UI checks that currently branch on `role = 'admin'`.
- **Editing the QAQC checklist template**: the checklist items live in the `qaqc_checklist_items` table — add, edit, or remove rows there (via SQL Editor or a future admin screen) to change what shows up per Flow/Stage. Existing signoffs are unaffected since they store their own snapshot of results.
- **EXIF-based geolocation**: currently location comes from the device's live GPS at upload time (more reliable — most phones strip GPS from photo files before sharing). If you also want to read embedded EXIF GPS tags as a fallback, a library like `exifr` can parse that client-side before upload.
- **Email notifications** on new incidents: use a Supabase Database Webhook or Edge Function triggered on insert to `safety_incidents`.
