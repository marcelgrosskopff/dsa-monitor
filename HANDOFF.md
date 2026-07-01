# DSA-Monitor — Handoff

Handoff for continuing work on **DSA-Monitor**, ÖIAT's Digital Services Act
compliance-research portal (netidee-funded). This complements `README.md` (stack &
base setup); read that first, then this for current state, recent work, deploy
mechanics, and next steps.

---

## 1. What it is

- **Public site**: independent DSA compliance research on very large platforms.
- **Stack**: Next.js 16 (App Router, TS) + Sanity (embedded Studio at `/studio`) + Netlify.
- **Repo**: https://github.com/marcelgrosskopff/dsa-monitor
- **Production**: https://dsa-monitor.netlify.app  (custom domain target: dsa-monitor.at)
- **Sanity**: project `vu4fqme7`, dataset `production` (public read).

---

## 2. Quickstart (get running in ~5 min)

```bash
git clone https://github.com/marcelgrosskopff/dsa-monitor.git
cd dsa-monitor
npm install
npm run dev            # http://localhost:3000  · Studio at /studio
```

**Runs with zero config on seed data.** With no `.env.local`, the site serves typed
seed content from `lib/seed-data.ts` (that's why `npm run dev` "just works"). To pull
**live Sanity content** locally, create `.env.local` (gitignored):

```
NEXT_PUBLIC_SANITY_PROJECT_ID=vu4fqme7
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_READ_TOKEN=<your Viewer token>
SANITY_API_WRITE_TOKEN=<your Editor token — only needed for the scripts>
```

Get your own tokens at **sanity.io/manage → project vu4fqme7 → API → Tokens**
(Viewer for read, Editor for write). Do **not** reuse tokens from chat logs.

Useful scripts: `npm run build` · `npm run typecheck` · `npm run lint` ·
`npm run seed` (re-seed Sanity from `scripts/seed.ts`).

---

## 3. Architecture map

```
app/                         # App Router pages
  page.tsx                   # Home
  publications/              # Hub + [slug] report detail
  resources/ about/ impressum/ privacy/ not-found.tsx
  studio/[[...tool]]/        # embedded Sanity Studio
  og-image.png/route.tsx     # dynamic OG image (next/og)
  api/{draft,revalidate,disable-draft}/route.ts
components/
  ds/                        # ported design-system primitives (Button, CategoryShape, TopicChip, KpiGrid, nav, footer…)
  blocks/                    # composed sections (Hero, HowWeWork, EvidenceBoxes, ConvictionCloser…)
  publications/              # client components (filter bar, pager)
  PortableBody.tsx           # Portable Text renderer (tables, links)
sanity/
  schemas/                   # report, topic, resourceGroup, siteSettings + page-copy singletons
  structure.ts               # Studio desk (Reports, Topics, Site settings, page singletons)
  lib/{client,queries,image}.ts
lib/{content,seo,format,counts,types,seed-data}.ts
styles/
  tokens/*.css + components.css + kit.css   # the LOCKED design system — do not restyle
  extensions.css             # OUR additive overrides (focus rings, KPI clamp, dark howwork, logo greyscale…)
  responsive.css             # media-query reflows (mobile nav, grids)
scripts/
  seed.ts                    # seed dataset from data.js
  populate-singletons.mjs    # fill page-copy singletons (so stega click-to-edit works)
  upload-logos.mjs           # upload partner/funder logos → siteSettings (see §6)
```

**Design-system rule:** `styles/tokens/*` + `components.css` + `kit.css` are the locked
"Direction A" system — treat as read-only. Put changes in `extensions.css` /
`responsive.css`, or in component markup. Laws: sharp corners, 1px ink hairlines, no
shadows/gradients/photos (per-category `CategoryShape` SVGs instead), red `#CA0013` =
single action colour, blue `#25378D` = brand/link/focus, one topic → one swatch, visible
focus ring, `prefers-reduced-motion` honoured.

> Note `AGENTS.md`: "This is NOT the Next.js you know" — v16 has breaking changes; check
> `node_modules/next/dist/docs/` before assuming older App Router behaviour.

---

## 4. Content model (Sanity Studio → `/studio`)

- **Reports** (`report`): one template for all types; `primaryTopic` drives the swatch.
- **Topics** (`topic`): label + swatch (red/blue/orange/purple/coral/green/neutral).
- **Resource groups**, **Site settings** (singleton: contact, LinkedIn, partners[], funders[]).
- **Page-copy singletons**: Home / About / Impressum / Privacy / Publications / Resources /
  404 pages — all editorial text is CMS-editable. (Listed as "… page" in the desk.)
- **Logos** are configurable: Site settings → partners[]/funders[] → `logo` image field.

Publish flow: editing in Studio → Sanity webhook → `/api/revalidate` → on-demand ISR.

---

## 5. Deploy

- **Auto-deploy**: push to `main` → GitHub → Netlify builds automatically. Verify at
  https://dsa-monitor.netlify.app.
- **Manual**: Netlify dashboard → project `dsa-monitor` → Deploys → **Trigger deploy**.
- **Netlify env vars** (set in dashboard, NOT in repo): the 4 `NEXT_PUBLIC_*` +
  `SANITY_API_READ_TOKEN` (+ `SANITY_REVALIDATE_SECRET` for the webhook).
- ⚠️ **Free-tier build minutes**: builds pause when the monthly budget is exhausted —
  a push then won't deploy until minutes reset or the plan is topped up. This bit us mid-session.
- On-demand content revalidation runs in the serverless function (no build minutes), but a
  cached page may still need a deploy/tag-revalidation to reflect new Sanity content.

---

## 6. Scripts you may need

| Script | What it does | Run |
|---|---|---|
| `scripts/upload-logos.mjs` | Uploads the 7 ÖIAT logos in `scripts/logos/` as Sanity assets and links them to `siteSettings.partners[]/funders[]` by `_key`. | `node scripts/upload-logos.mjs` (needs `.env.local` with Editor token) |
| `scripts/populate-singletons.mjs` | Seeds default strings into page-copy singletons so stega click-to-edit works. | `node scripts/populate-singletons.mjs` |
| `scripts/seed.ts` | Full dataset seed from `data.js`. | `npm run seed` |

`scripts/logos/` is gitignored — the source logos also live in the design ZIP
(`.../dsa-monitor/logos/`). Grey display filter for logos is in `extensions.css`.

---

## 7. Current state (as of this handoff)

**Live on production** (`main` @ `476201a`):
- Full site across all pages; content served from Sanity (`vu4fqme7/production`).
- All 6 partner + 1 funder (netidee) **logos uploaded**, greyscale display, colour on hover.
- Design-review feedback applied (see §8).

**Recently shipped this session** — see §8 for the full log.

**Verified**: responsive from 1280→375px (no overflow); logos render 46px greyscale;
impressum address correct; presentation-mode CategoryShapes fixed.

---

## 8. Work history — design-review round (Julia Krickl / Iris Strasser PDF)

The review comments were Adobe Acrobat annotations extracted from the (image-based) design
PDF. All 9 addressed:

| # | Feedback | Resolution | Commit |
|---|---|---|---|
| 1, 9 | Category icons too symbolic / too big | Red → horizontal rules, blue → concentric squares (neutral); smaller on mobile | `3ad0aa3` |
| 2 | Two-column mobile footer | Footer nav 2-col on mobile, brand full-width | `3ad0aa3` |
| 3 | More eye-catching CTA button | Graphical white square mark before primary button label | `3ad0aa3` |
| 4 | Report with no KPIs | **OPEN** — currently hidden when empty; decide bold-sentence vs leave out | — |
| 5 | Impressum address | Ungargasse 64–66/3/404, 1030 Wien (+ phone) — patched in Sanity | (content) |
| 6 | Impressum lacks eye-catching feature | 3px red left-border on legal cards | `3ad0aa3` |
| 7 | Dark theme should carry through / rethink light-blue band | "How we work" band → header navy (`band--inverse`) with adapted text/borders | `476201a` |
| 8 | Logos too colourful | Greyscale by default, colour on hover; logos uploaded | `3ad0aa3` + upload |

**Also fixed this session:**
- **Presentation-mode shapes invisible** (`a1f9565`): Sanity stega encoding polluted the
  `swatch` string used to build CSS variable names → invalid var → blank shapes. Fix:
  `stegaClean()` the swatch/accent logic-keys in `lib/content.ts` (display text keeps stega).
- **Studio labels** (`a1f9565`): renamed page singletons "X copy" → "X page".
- **KPI overflow** (`1c38c27`): numbers spilled out of cells in the article's narrow column.
  Fluid `clamp()` size + grid steps 4→2→1 columns. `extensions.css`.
- **Mobile legal cards** (`1c38c27`): impressum grid was hard-coded 2-col → clipped on
  mobile; now 1-col ≤768px.
- **Logo sizing** (`26eac3e`): an earlier override collapsed logos to ~27px; reverted so the
  design's `height:46px` wins.

Full commit history: see `git log` (or `COMMIT-HISTORY.txt` in the handoff zip).

---

## 9. Open items / next steps

- **Annotation #4** — decide handling for reports with no KPIs (single bold pull-quote vs
  hide entirely). Currently hidden. Would need a `kpiCallout` field if a sentence is wanted.
- **LinkedIn URL** — `siteSettings.linkedinUrl` is the generic `https://at.linkedin.com`;
  replace with ÖIAT's real profile.
- **Privacy policy** — the body is a placeholder GDPR notice; ÖIAT should supply the official text.
- **Custom domain** — production is on `*.netlify.app`; point `dsa-monitor.at` when ready.
- **`/studio` deploy** — confirm CORS origin for the production URL in Sanity manage.

---

## 10. Gotchas & security

- 🔐 **Rotate the Sanity tokens.** During this session a read token and a write token were
  pasted/printed into the assistant transcript. Regenerate both at sanity.io/manage → API →
  Tokens, and update the Netlify env var + any local `.env.local`. Nothing in the repo depends
  on a specific token value.
- **Never commit `.env.local`** (already gitignored).
- **Seed vs live data locally**: no `.env.local` → seed data; with it → live Sanity. If your
  local looks "stale" vs production, that's this switch.
- **Two dev-server behaviours for env changes**: `.env.local` is read at server start —
  restart `npm run dev` after editing it.
- **Multiple `claude` installs / Netlify build minutes** are environment quirks, not code.

---

## 11. Getting access (ask the project owner)

- **GitHub**: collaborator on `marcelgrosskopff/dsa-monitor`.
- **Netlify**: member of the team owning project `dsa-monitor` (for deploys/env/logs).
- **Sanity**: member of project `vu4fqme7` (to edit content + mint your own tokens).
- **claude.ai org** (vlabs development kft.): needed only if sharing Claude Code sessions.
