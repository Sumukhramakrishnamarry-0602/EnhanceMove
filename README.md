# EnhanceMove — CRM

A production-ready, multi-tenant CRM built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres + Auth + Storage). Every user's data — contacts, companies, deals, activities, and tasks — is isolated with Postgres Row Level Security.

## Stack

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Radix UI primitives
- **Backend:** Supabase (Postgres, Auth, Storage), Server Actions for all mutations
- **Charts:** Recharts
- **Hosting:** Vercel (frontend) + Supabase (DB/Auth/Storage)

## How multi-tenancy works

Every table (`companies`, `contacts`, `deals`, `activities`, `tasks`) has an `owner_id` column referencing `profiles.id`. Row Level Security policies restrict every `select` / `insert` / `update` / `delete` to rows where `owner_id = auth.uid()`. This means:

- Isolation is enforced **in the database**, not just in application code — even if a bug in the UI leaked a raw query, Postgres would still refuse to return another user's rows.
- A `profiles` row is created automatically for every new `auth.users` row via a trigger (`handle_new_user`), so there's no separate "create profile" API call to forget.
- The `team_members` table exists as groundwork for future multi-user sharing but isn't wired into RLS yet — v1 is single-owner per row, matching the MVP scope.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's provisioned, open **SQL Editor → New query**.
3. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it. This creates all tables, indexes, triggers, RLS policies, and the `avatars` storage bucket.

## 2. Configure Supabase Auth

In **Authentication → Providers**:
- Ensure **Email** is enabled.
- Under **Email → Settings**, magic link ("OTP") sign-in is enabled by default alongside password sign-in — no extra config needed.

In **Authentication → URL Configuration**:
- Set **Site URL** to your production URL (e.g. `https://enhancemove.vercel.app`).
- Add `http://localhost:3000/auth/callback` and `https://your-domain.com/auth/callback` to **Redirect URLs**.

## 3. Environment variables

Copy the example file and fill in values from **Project Settings → API**:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (server-only, never expose client-side) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally, your deployed URL in production |
| `ANTHROPIC_API_KEY` | Optional — enables the AI "Insight" summary on activities. Leave blank to use the built-in rule-based fallback. |

## 4. Install and run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Sign up, complete onboarding, and you're in.

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project** → import the repo.
3. Add the same environment variables from `.env.local` in **Project Settings → Environment Variables** (use your production `NEXT_PUBLIC_SITE_URL`).
4. Deploy.
5. Back in Supabase, add your Vercel URL to **Authentication → URL Configuration → Redirect URLs** (`https://your-app.vercel.app/auth/callback`).
6. Test in production: sign up → confirm email → onboarding → create a contact, company, and deal → drag a deal to "Proposal" and confirm a task was auto-created.

## Customizing branding

- **Name:** search for `EnhanceMove` across `app/layout.tsx`, `components/layout/navbar.tsx`, and the `(auth)` layout, and replace with your product name.
- **Logo:** the `E` monogram square in `components/layout/navbar.tsx` and `app/(auth)/layout.tsx` can be swapped for an `<Image>` / SVG logo.
- **Color palette:** all colors are defined as HSL CSS variables in `app/globals.css` (`--primary`, `--success`, `--warning`, etc.) and as a `primary` scale in `tailwind.config.ts`. Change `--primary` (and the `primary.50`–`900` scale) to re-theme the entire app — every component reads from these tokens, nothing is hardcoded.
- **Font:** `app/layout.tsx` loads Inter via `next/font/google`. Swap the import to use a different typeface.

## Project structure

```
app/
  (auth)/login, signup          — public auth pages
  auth/callback                 — magic link / email confirmation handler
  onboarding/profile            — first-run profile setup, gated by middleware
  (dashboard)/                  — authenticated app shell (navbar + routes)
    dashboard/                  — KPIs, pipeline chart, recent activity
    contacts/, companies/       — list, detail, new
    deals/                      — kanban + list pipeline views, detail
    activities/                 — global activity feed
    tasks/                      — task list with due-soon/overdue/completed tabs
    profile/                    — profile, password, notification settings
  api/ai/insight/                — optional AI note-summary endpoint
components/
  ui/                            — base design system (button, input, dialog, etc.)
  layout/, shared/                — navbar, empty states, activity timeline, dialogs
  contacts/, companies/, deals/, tasks/, dashboard/, profile/ — feature components
lib/
  supabase/                      — browser + server Supabase clients, DB types
  actions/                       — Server Actions (all mutations happen here)
  validators/                    — Zod schemas for every form
supabase/schema.sql              — full DB schema + RLS policies
middleware.ts                    — auth session refresh + route protection + onboarding gate
```

## Automations included

- Creating a deal auto-logs an "Intro call" activity.
- Moving a deal's stage to **Proposal** (via kanban drag-and-drop or the edit form) auto-creates a "Send proposal" task due in 2 days.
- Contacts not logged an activity against in 14+ days show a **"No recent activity"** badge in the contacts list and drive the "next best action" hint on their detail page.

## Known follow-ups (not in v1 scope)

- `team_members` table exists but sharing/collaboration isn't wired into the UI or RLS yet.
- Email notifications (the toggles in Profile → Notifications) update a preference flag but don't yet send emails — wire up Supabase's SMTP/webhooks or a provider like Resend when ready.
