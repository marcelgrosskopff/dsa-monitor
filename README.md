# DSA-Monitor

Independent Digital Services Act compliance-research portal for **ÖIAT** (funded by netidee).
Next.js (App Router) + Sanity (embedded Studio) + Netlify. English-only UI; reports offered
as separate DE/EN downloads. Built by porting the approved design system ("Direction A") and
the all-pages canvas — not redesigned.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) — static-leaning with ISR + on-demand revalidation.
- **Sanity** — headless CMS + embedded Studio at `/studio`.
- **Netlify** — hosting/CDN/SSL via `@netlify/plugin-nextjs`; deploy previews per branch.
- **Matomo** — cookieless + IP-anonymised analytics (no consent banner).
- Fonts (Google Fonts, locked): Be Vietnam Pro / Carlito / IBM Plex Mono.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (Studio at /studio)
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

**No Sanity project is required to run.** When `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset, the
site serves typed seed content from `lib/seed-data.ts`, so every page renders immediately.
Once the project id is set, the data layer (`lib/content.ts`) fetches from Sanity instead.

## Environment

Copy the keys below into `.env.local` (not committed). See each var's role:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project; empty = serve seed content |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | e.g. `2025-01-01` |
| `SANITY_API_READ_TOKEN` | Viewer token — draft-mode preview |
| `SANITY_API_WRITE_TOKEN` | Editor token — used **only** by `npm run seed` |
| `SANITY_REVALIDATE_SECRET` | Shared secret on the Sanity webhook → `/api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | `https://dsa-monitor.at` |
| `NEXT_PUBLIC_MATOMO_URL` | ÖIAT Matomo base URL (enables analytics + opt-out) |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | Matomo site id |

## Provision Sanity

1. `npx sanity login` then create a project + `production` dataset (public read).
2. Create two API tokens: **Viewer** (`SANITY_API_READ_TOKEN`) and **Editor** (`SANITY_API_WRITE_TOKEN`).
3. Put project id + dataset + tokens in `.env.local` (and in Netlify env).
4. In Sanity manage, add a **webhook** → `https://<site>/api/revalidate` with secret
   `SANITY_REVALIDATE_SECRET` (trigger on create/update/delete). Publishing then goes live
   without a rebuild. The secret must match the `SANITY_REVALIDATE_SECRET` env var on
   Netlify exactly.

> **Note:** the one-time `npm run seed` script was removed after the production dataset went
> live — it predated the `organization` reference model and re-running it would have
> corrupted live content. Content is now managed entirely in the Studio. Without
> `.env.local`, the app still runs on the typed fallback in `lib/seed-data.ts`.

## Content model (Studio)

`report` is a single schema used for every publication — no separate types for Study /
Dossier / Policy Paper. Reports are categorised by their `primaryTopic` reference, which
drives colour coding on the site. Other types: `topic`, `resourceGroup`, `siteSettings`
(singleton), and page-copy singletons (`homeContent`, `aboutContent`, `impressumContent`,
`privacyContent`).
**Do not author legal/privacy copy — render client-supplied text only.**

## Deploy (Netlify)

- Connect the repo; `netlify.toml` sets `next build` + `@netlify/plugin-nextjs` + Node 20.
- Add the env vars above in Netlify.
- Branch deploys give staging previews. Production domain: `dsa-monitor.at`.

## Project map

- `app/` — routes: Home, `/publications` (+ `[slug]`), `/resources`, `/about`, `/impressum`,
  `/privacy`, `not-found`, `sitemap.ts`, `robots.ts`, `api/{draft,revalidate}`, `studio/`.
- `components/ds/` — the 16 ported design-system primitives (typed).
- `components/blocks/` — section blocks (Page shell, Hero, KpiStrip, EvidenceBoxes, closer, ResearchCardX).
- `components/publications/PublicationsClient.tsx` — the only filter island (topic-only, URL-synced).
- `lib/` — `content.ts` (Sanity-or-seed), `counts.ts`, `format.ts`, `seo.ts`, `seed-data.ts`, `types.ts`.
- `sanity/` — env, client/queries/image, schemas, desk structure; `sanity.config.ts` (Studio).
- `styles/` — design-system tokens + components.css + kit.css (ported verbatim) + `responsive.css`
  (mobile reflow authored from the canvas's `.m-page` overrides) + `extensions.css`.

## Still pending from ÖIAT (built with placeholders)

Final topic list + topic→swatch map; "What we do / why we do it" copy; remaining report
summaries; canonical Impressum + privacy text. All marked with a placeholder note; nothing is
fabricated. See `ACCESSIBILITY.md` for the WCAG 2.1 AA report and manual test checklist.
