# AGENTS.md

Onboarding notes for AI coding agents (and humans) working in this repo. Read this before changing anything. User-facing setup and deployment docs are in [README.md](README.md).

## What this is

**RepoRadar** ("GitHub Intelligence & Repo Discovery Engine") — a single-page web app that surfaces GitHub repositories that are popular/viral and scores them for **commercial reuse** by developers and small agencies: how to fork them, how to monetize them, and how to pitch a client on them.

Three sources feed the UI:

1. **Curated list** — 12 hand-written repos in `server/curatedRepos.ts` (always available, offline-safe).
2. **Live GitHub Search API** — most-starred repos per category, merged with the curated list.
3. **Gemini** — "AI Deep Search" (recommend repos), "AI Audit" (monetization blueprint for one repo), and "Pitch" (client proposal email).

There is **no database and no auth**. The only persistence is the browser's `localStorage` (key `agency_saved_repos`) for the "Agency Pipeline" bookmarks.

## Commands

| Command | What it does |
| :--- | :--- |
| `npm install` | Install deps. Generates `package-lock.json` (currently untracked). |
| `npm run dev` | Vite dev server on `http://localhost:3000` (`--host=0.0.0.0`). The Express API is mounted **inside** Vite as middleware (`vite.config.ts`), so one process serves UI + `/api`. |
| `npm run build` | `vite build` → `dist/` (frontend only). |
| `npm start` | `node server.ts` — Express serves `dist/` + `/api` on **port 3000 (hard-coded)**. Run `npm run build` first. |
| `npm run lint` | `tsc --noEmit`. This is the only automated check. |
| `npm run clean` | `rm -rf dist server.js`. |

There are **no tests, no CI, no formatter/linter config** beyond `tsc`.

Last verified: Node 24.20 / npm 11.19 — `npm install`, `npm run lint`, `npm run build`, `npm run dev` and `npm start` all work; every API route responds (with no keys set).

## Environment

Copy `.env.example` → `.env` (gitignored via `.env*`, except `.env.example`).

| Var | Needed? | Effect when missing |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | For real AI output | `getGemini()` throws → every `/api/ai/*` route catches it and returns **canned fallback data** (see "Fallbacks"). The app still looks like it works. |
| `GITHUB_TOKEN` | Optional | GitHub Search limited to 60 req/hr/IP; on failure the routes silently fall back to curated repos. |

`PORT` is **not** read by anything (README used to claim otherwise). `APP_URL` is unused.

## Architecture

```
Browser (React SPA)  ──fetch /api/*──▶  Express Router (server/routes.ts)  ──▶  GitHub Search API
                                                                          └──▶  Gemini (server/gemini.ts)
```

One Express `apiRouter` (`server/routes.ts`) is mounted in three places — keep them in sync if you change how it's mounted:

| Entry | Used by | File |
| :--- | :--- | :--- |
| Vite middleware plugin | `npm run dev` | `vite.config.ts` |
| Standalone server | `npm start` | `server.ts` |
| Vercel serverless function | Vercel deploys | `api/index.ts` + `vercel.json` rewrite `/api/(.*)` → `/api` (**not yet deployed/tested by us**) |

### API (`server/routes.ts`)

| Route | Purpose | Notes |
| :--- | :--- | :--- |
| `GET /api/repos/trending?category=&sort=` | Curated + live GitHub repos. `category`: `all\|ai-agents\|saas-starter\|automation\|agency-solutions\|devtools`. `sort`: `stars\|rating\|velocity`. | Live results cached in-memory 15 min (per instance). Sorting/filtering happens after the merge. |
| `GET /api/repos/search?q=` | GitHub keyword search (top 20 by stars). | Falls back to substring match on curated repos if GitHub fails. Empty `q` → curated list. |
| `POST /api/ai/deep-search` `{prompt, focus, timeframe}` | Gemini returns 6–8 repos as JSON. | Falls back to curated repos with `isFallback: true` + `notice`. |
| `POST /api/ai/analyze` `{repoUrl, repoName, description, language, license}` | Gemini "commercial audit" → `CommercialAudit`. | 400 if neither `repoUrl` nor `repoName`. Falls back to a generic template with `isFallback: true`. |
| `POST /api/ai/pitch` `{repoName, clientIndustry, clientPainPoint}` | Gemini client-proposal email. | Falls back to a template with `isFallback: true`. |

All Gemini calls use model id `gemini-3.8-flash` (hard-coded 4×) via `@google/genai`, with a 60 s client timeout (`server/gemini.ts`). **This model id has not been exercised against a live key by us — verify it before relying on it.**

### Frontend (`src/`)

- `App.tsx` — all top-level state: repo list, filters, loading/error/notice, modals, saved repos (localStorage). Talks to `/api/repos/*` and `/api/ai/deep-search`.
- `components/DeepSearchHeader.tsx` — hero, keyword search (fires on **every keystroke**, no debounce), AI prompt box, 4 preset prompts, category/timeframe/sort controls.
- `components/RepoCard.tsx` — one repo card + "save to pipeline" menu (`to-fork | client-project | saas-idea | contributing`).
- `components/AnalysisModal.tsx` — calls `/api/ai/analyze` on open; has the pitch generator (`/api/ai/pitch`).
- `components/CustomAnalyzeModal.tsx` — paste any `owner/repo` URL; fetches metadata **directly from api.github.com in the browser** (unauthenticated), then opens the audit.
- `components/ForkModal.tsx` — `gh repo fork` / `git clone` quickstart.
- `components/SavedReposDrawer.tsx` — bookmarks by category, export to Markdown.
- `types.ts` — `RepositoryItem`, `CommercialAudit`, `SavedRepo`. **`RepositoryItem` is duplicated** in `server/curatedRepos.ts`; change both or (better) dedupe.

Styling is Tailwind CSS v4 (`@import "tailwindcss"` in `src/index.css`, `@tailwindcss/vite` plugin — no `tailwind.config`). Dark theme only. Icons: `lucide-react`.

### Data model

`RepositoryItem` (see `src/types.ts`): identity + GitHub stats + the "intelligence" fields `category`, `agencyUseCases`, `monetizationAngle`, `commercialRating` (1–100), `forkRecommendation`, optional `creatorBuzz`. Categories: `saas-starter | ai-agents | agency-solutions | devtools | automation`.

## Conventions and gotchas

- **ESM everywhere** (`"type": "module"`). Server code is run by **Node's native TypeScript type-stripping** (`node server.ts`), not tsx/ts-node. Consequences:
  - Relative imports in `server/`, `api/`, `server.ts`, `vite.config.ts` **must include the `.ts` extension**.
  - Type-only imports **must use `import type`** (Node does not erase regular imports of types → runtime `does not provide an export named …`).
  - No enums, namespaces, or parameter properties on the server side.
  - Needs a Node with unflagged type stripping (22.18+). We tested on 24. README's "Node 18+" is wrong for `npm start`.
- `tsconfig.json` has `noEmit`, `allowImportingTsExtensions`, and is **not `strict`** — lots of `any` in `routes.ts`. `tsc` passing does not mean much for type safety.
- Vite `@` alias points at the repo root (`./`), not `src/`.
- Response envelope is `{ success: boolean, ...data }` / `{ success: false, error }`.
- AI JSON parsing strips ```json fences and falls back to slicing from the first `[`/`{`. Keep that tolerance if you touch it.

## Known issues (found in the audit — none fixed yet unless noted)

Correctness / honesty of output
1. **Fallbacks are invisible for `/analyze` and `/pitch`.** The API sets `isFallback: true` but the frontend never reads it (`grep isFallback src` → nothing). With no/bad key, users see a generic audit with a fixed score of 92 as if it were real analysis.
2. **"AI Deep Search" is not grounded.** Gemini is called with no search/grounding tool, so repos, star counts (`starsEstimate`) and `creatorBuzz` ("YouTube/X are raving…") can be hallucinated. The UI text says it "searches internet, creator channels & GitHub". Repos are not verified against the GitHub API. Deep-search avatars are fake (`avatars.githubusercontent.com/u/<hash>`); use `https://github.com/<owner>.png`.
3. **`commercialRating` for live GitHub repos is a formula** (base 80 + license bonus + star bonus, clamped 70–99), and `agencyUseCases` / `monetizationAngle` are the same template string for every repo. Only the 12 curated repos have real human-written analysis.
4. **"Trending" isn't trending.** Live fetch = all-time most-starred with `stars:>1000`. "velocity" sort is just `pushed_at`, not star growth. The **Daily/Weekly/All-Time selector only affects AI deep search**, not the feed. Real "viral" detection needs star-count snapshots over time (or GitHub Trending / a stars-history source).
5. **`category: "all"` leaks into results** — `formatGithubRepo(it, category as any)` passes the UI filter value as the fallback category; on the "all" tab, unmatched repos get an invalid category (e.g. `tt-a1i/archify`). Category is inferred from topics heuristically (e.g. `awesome-claude-skills` → `saas-starter`).
6. **Curated data is stale/fake-fresh**: hard-coded star counts, and `updatedAt` is computed as "now − N days" at import time.
7. `CustomAnalyzeModal` defaults to `TypeScript` / `MIT` if the browser-side GitHub call fails (rate limit), then feeds that wrong license into the audit prompt.

Product / infra
8. **AI routes are unauthenticated and unthrottled** → anyone can burn the Gemini quota. Add auth and/or rate limiting before public launch or any paid tier.
9. Cache is in-memory and per-instance (useless/inconsistent on Vercel serverless).
10. AI calls can take up to 60 s but no `maxDuration` is set in `vercel.json` (README says Hobby functions cap at 15 s), so long Gemini calls will be cut off on Vercel and fall through to the canned fallback.
11. `server.ts` hard-codes port 3000 (ignores `PORT`).
12. UI-only leftovers: `animate-in fade-in …` classes (6 uses) do nothing — no `tailwindcss-animate`/`tw-animate-css` installed; `SavedRepo.notes` exists in the type and Markdown export but there is no UI to set it.
13. Unused deps: `motion`, `autoprefixer`, `esbuild`, `tsx`. (`esbuild` was bumped `^0.25` → `^0.28` only because `vite@8.3` peer-requires `^0.27 || ^0.28` and `npm install` failed otherwise.)
14. `package.json` name is still `react-example`; `metadata.json` / `.env.example` are AI Studio scaffolding leftovers.
15. Keyword search has no debounce — one GitHub Search request per keystroke, which will exhaust the unauthenticated 10 req/min search limit quickly.

Fixed during onboarding
- `npm install` peer-dependency conflict (esbuild) — see #13.
- `npm start` crashed: extensionless imports and a value-import of a type in `server/routes.ts`. Now `.ts` extensions + `import type`.

## Suggested checks before you finish a change

```bash
npm run lint && npm run build          # must pass
npm run dev                            # then curl the routes you touched:
curl -s "localhost:3000/api/repos/trending?category=all&sort=stars" | head -c 300
curl -s -X POST localhost:3000/api/ai/analyze -H 'content-type: application/json' -d '{"repoName":"calcom/cal.com"}'
npm start                              # (after build, stop dev first: port 3000) — production path has broken before
```

The UI itself has not been checked in a browser in the onboarding pass; verify UI changes visually.
