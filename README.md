# Graphily

A personal knowledge-gap graph. Capture concepts you do not know yet, then generate a graph of prerequisites, named relationships, a learning order, and real resource links.

Auth and data live on **Supabase** (Auth + Postgres) so progress is saved online and the app can deploy to Netlify.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run [`db/supabase.sql`](db/supabase.sql).
3. **Authentication → Providers → Email**: enable Email. Keep Confirm email on if you want verification emails.
4. **Authentication → URL Configuration**:
   - **Site URL**: your deployed origin (e.g. `https://your-app.netlify.app`), or `http://localhost:3000` for local-only.
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://YOUR_DOMAIN/auth/callback` (and `/**` wildcards if Supabase allows).
5. Project Settings → API: copy **Project URL** and **anon public** key.
6. Project Settings → Database → Connection string → **Transaction** pooler (port `6543`). Use that as `DATABASE_URL`. Append `?pgbouncer=true` if it is not already present.

## Run locally

Copy env values into `.env.local` (see below), then:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test
```

The app always uses Supabase Postgres via `DATABASE_URL`. Unit tests may use temporary PGlite (`ALLOW_PGLITE=1`); that path is not used by `npm run dev`.

## Environment variables

Required for the app (local and Netlify):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Transaction pooler Postgres URI (`:6543`, `pgbouncer=true`) |
| `AI_KEY_SECRET` | 32+ character server secret that encrypts users' API keys (`openssl rand -base64 48`) |

Optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin for confirmation emails (defaults to request host / Netlify `URL`) |
| `YOUTUBE_API_KEY` | Adds YouTube video results |
| `APPLY_SCHEMA=1` | Force-apply `db/schema.sql` against `DATABASE_URL` (default: on outside production, off in production). Prefer `db/supabase.sql` in the SQL editor for hosted DB. |

Without `DATABASE_URL`, the app fails fast (no silent local database).

## Deploy on Netlify

1. Connect the Git repo to Netlify (Next.js runtime / `@netlify/plugin-nextjs` as offered by Netlify for Next 16).
2. Set the same env vars as local: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `AI_KEY_SECRET`, plus any YouTube key.
3. Deploy. Signup/login use Supabase Auth cookies; spaces and progress write to Supabase Postgres via `DATABASE_URL`.

## Bring your own key

The app has no shared model key. After signing up, each user lands on `/settings`. There they pick a provider (OpenAI, Groq, Google Gemini, or OpenRouter), a preferred model, and paste an API key. The key is checked with one small request, encrypted with AES-256-GCM using `AI_KEY_SECRET`, and stored in `ai_settings`. The dashboard and space creation stay locked until this is done. Graph generation, topic definitions, and parent inference all use the signed-in user's own key.

For a hosted database created before this change, run [`db/ai-settings.sql`](db/ai-settings.sql) once in the Supabase SQL editor (it is applied automatically when `APPLY_SCHEMA` is on).

## Schema notes

- [`db/supabase.sql`](db/supabase.sql) — hosted schema; `users.id` references `auth.users`.
- [`db/schema.sql`](db/schema.sql) — test schema for temporary PGlite (same tables, no `auth.users` FK).
