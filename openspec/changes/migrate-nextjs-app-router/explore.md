# Exploration: migrate-nextjs-app-router

> SDD exploration artifact — read-only analysis. Date: 2026-08-09
> Project goal reference: `DevBlog.md` (Portafolio Full Stack Jr / 02-devblog)

## Current State

The app is a **client-side SPA**: React 19.2.4 + Vite 7.3.1 + TypeScript ~5.9 (strict) + react-router-dom 7 (BrowserRouter, 9 routes) + Tailwind v4 + shadcn/ui (radix-ui "new-york"). All data flows through `@supabase/supabase-js` with the anon key; there is no server layer at all.

- **Data model (supabase/migrations)**: `authors`, `categories`, `posts`, `tags`, `post_tags` (junction). RLS is enabled but every table has open `anon` SELECT/INSERT/UPDATE/DELETE policies — the admin area is unauthenticated and the API is fully open. Seed: 1 author, 5 categories, 10 tags, 5 published posts with real markdown content.
- **Pages (src/pages)**: BlogHome (search `ilike` on title, category/tag filters, featured post), PostDetail (markdown render, client-side `views` increment, reading time, author card, edit link), CategoriesList/CategoryDetail, AuthorProfile, AdminList (stats, search, delete), AdminEditor (plain `<Textarea>` markdown + preview toggle, slugify, reading-time estimate, tags multi-select, draft/published).
- **Components**: Navbar (client, router links), PostCard, MarkdownRenderer (react-markdown v10 + remark-gfm), theme-provider/mode-toggle (next-themes), ~50 shadcn `ui/` components.
- **SEO: none**. `index.html` carries a static `<title>shadcn/ui</title>` (template leftover), no meta description, no OG/Twitter tags, no JSON-LD, no sitemap, no robots.txt, no favicon beyond `vite.svg`.
- **Tooling gaps**: no git repo, no tests, no lint, no CI, no `.env` files, no image upload (cover_image is a free-text URL).
- **Installed but unused**: react-hook-form, zod, @hookform/resolvers, recharts, vaul, cmdk, react-day-picker, embla-carousel, etc. (shadcn template bloat).

### Gaps vs. the goal (DevBlog.md)

| Goal (Next.js 14 App Router) | Current state | Delta |
|---|---|---|
| SSR / SSG / ISR | Client-side fetch everywhere | Full rewrite of data flow |
| Server/Client Components | No concept | Re-architect per page |
| NextAuth.js v5 | No auth at all (open RLS) | Greenfield |
| PostgreSQL + Prisma | Supabase JS client (BaaS) | New ORM + connection strategy |
| Dynamic SEO (metadata, OG, JSON-LD, sitemap) | None | Greenfield |
| Image upload | None | Greenfield |
| Fulltext search (tsvector) | `ilike` on title only | Greenfield |
| Deploy Vercel + CI | None (no git repo) | Greenfield |
| Markdown / MDX processing | react-markdown (client) | Server-side pipeline + editor polish |

## Affected Areas

- `index.html` — replaced by `app/layout.tsx` metadata; static "shadcn/ui" title must go (SEO debt today).
- `vite.config.ts`, `tsconfig.node.json`, `src/main.tsx`, `src/App.tsx` — removed; replaced by `next.config.mjs`, `app/` route tree + layouts.
- `package.json` — scripts (`next dev/build/start`), deps swap: drop vite/react-router; add `next`, `react` (server-compatible), `prisma/@prisma/client`, `remark`/`rehype` server pipeline, `@auth/*` (follow-up), `@tailwindcss/postcss`.
- `src/lib/supabase.ts` — becomes `lib/db.ts` (Prisma client singleton) or a server-only Supabase adapter; types (Post/Author/Category/Tag) carry over.
- `src/lib/utils.ts` — kept (`cn`, slugify, reading time, date formats).
- `src/pages/*` — rewritten as App Router route components: BlogHome → `app/(public)/page.tsx`, PostDetail → `app/(public)/posts/[slug]/page.tsx` (+ `generateStaticParams`, `generateMetadata`), CategoryPages → `app/(public)/categories/…`, AuthorProfile → `app/(public)/authors/[id]/page.tsx`, Admin → `app/(admin)/…` (protected).
- `src/components/PostCard.tsx`, `Navbar.tsx`, `MarkdownRenderer.tsx` — split: server-rendered where possible (Navbar/PostCard can be server since links only), MarkdownRenderer splits into server render (remark/rehype → HTML) + client preview (react-markdown).
- `src/components/ui/*` (shadcn) — ported largely as-is as client components; `components.json` regenerated for Next.
- `supabase/migrations/*` — superseded by `prisma/schema.prisma` (+ baseline migration) if Prisma is adopted; kept as backup/seed source.
- `public/` — replace `vite.svg`; add app icon, OG image assets.
- Env — `VITE_SUPABASE_URL/ANON_KEY` → `NEXT_PUBLIC_*` / server-only vars (`DATABASE_URL`, service key); new `.env.local`.

## Approaches — Key Decisions

### D1. Auth: NextAuth vs Supabase Auth vs defer

1. **NextAuth.js (Auth.js v5)** — matches the goal verbatim ("autenticación con NextAuth.js"); middleware-based route guard for `(admin)`; Credentials provider (single admin) or GitHub OAuth; `@auth/prisma-adapter` once Prisma lands.
   - Pros: teaches the target skill; standard Next ecosystem; session via JWT works server-side in RSC.
   - Cons: v5 is beta (`next-auth@beta`); adapter database pairing must be decided now.
   - Effort: High — but it is a self-contained follow-up change.
2. **Supabase Auth** — reuse existing Supabase; PKCE flow + RLS `authenticated` roles.
   - Pros: zero new infra; RLS already exists.
   - Cons: contradicts the learning goal; current app has no users/sessions to preserve (RLS is open, nothing to port); portfolio value lower.
   - Effort: Medium.
3. **Defer auth out of the first change** — keep `/admin` open in the interim (exactly as it is today), add NextAuth as its own change.
   - Pros: migration stays focused on framework + data + SEO; auth is greenfield anyway.
   - Cons: admin stays public longer (already public today — no regression).
   - Effort: Low now.

### D2. Database: Prisma over what Postgres?

1. **Prisma → same Supabase Postgres (direct connection)** — keep the existing DB and seed data; `prisma db pull` to introspect, baseline migration for history.
   - Pros: preserves data; zero local infra; still full Prisma + SQL learning; portfolio shows "PostgreSQL + Prisma" honestly.
   - Cons: add Supabase's connection-pooling semantics (port 5432 direct for migrate vs 6543 pgbouncer for serverless runtime); RLS becomes bypassed dead weight (tighten later with auth change).
   - Effort: Medium.
2. **Prisma → local Docker Postgres + re-seed** — classic dev setup, `docker compose` Postgres 16, re-seed from the existing SQL file; on Vercel point `DATABASE_URL` at Neon/Supabase/PlanetScale.
   - Pros: canonical "PostgreSQL + Prisma" workflow, clean `prisma migrate dev` history from scratch; showcases migrations in the repo.
   - Cons: needs Docker locally; drops current DB contents (re-seed required — SQL already exists); two environments to configure (local + cloud).
   - Effort: Medium–High.
3. **Keep supabase-js as server-side interim** (service role in RSC) — fastest parity path.
   - Pros: least churn; page components async without ORM work.
   - Cons: defers Prisma (double work rewiring later); service role key exposure risk if mishandled; RLS bypassed anyway.
   - Effort: Low now, Medium later.

### D3. Rendering strategy per page (App Router)

- **Home** — static + ISR (`export const revalidate`, e.g. 300s) when no filters; dynamic when `searchParams` present (filters/search). Server Component reading searchParams.
- **Post detail** — SSG via `generateStaticParams` (all published posts) + ISR `revalidate` 60–300s or **on-demand** `revalidateTag('posts')` after admin save (Server Action); `dynamicParams` handling + `not-found()`. The client-side `views` increment must move to a small route handler/Server Action (static pages can't increment per view).
- **Categories / Authors** — SSG + ISR with `generateStaticParams`.
- **Admin** — dynamic, server-fetched data in RSC, client components only where interactive (editor form).
- Every segment: `loading.tsx` (maps to today's Skeleton states), `error.tsx`, `not-found.tsx`.

### D4. Markdown rendering

1. **Server-side pipeline (remark + rehype)** for public pages — `remark-gfm` + `rehype-highlight`, render to HTML in the Server Component (or compile to React elements); admin preview keeps client `react-markdown`.
   - Pros: zero client JS for article body (faster, SEO-clean); reuses the exact plugins already in `package.json`.
   - Cons: must sanitize (rehype-sanitize or content trust); two render paths to keep consistent.
   - Effort: Low–Medium.
2. **Client react-markdown everywhere** (status quo + `'use client'`) — minimal change.
   - Pros: fastest.
   - Cons: defeats SSR benefit for the most important content; the goal explicitly wants server processing.
   - Effort: Low.
3. **MDX (@next/mdx or next-mdx-remote)** — custom components inside articles.
   - Pros: goal mentions "Markdown / MDX"; powerful.
   - Cons: overkill for a JR portfolio; content is plain markdown; another build complexity.
   - Effort: Medium — optional stretch.

> Design-phase verification point: react-markdown v10 Server Component compatibility — avoided entirely by option 1.

### D5. SEO

- Root layout: `metadataBase`, site title/description, default OG/Twitter, `viewport`, JSON-LD `WebSite`.
- `generateMetadata` per page: posts → `Article` (title, description, `openGraph.article` publishedTime, canonical); authors → `Profile`; categories → `CollectionPage`.
- JSON-LD `Article` script injected in post detail (Server Component).
- `app/sitemap.ts` + `app/robots.ts` (built-in Next 14 metadata routes).
- `next/image` for cover images (goal: "optimización de imágenes").
- URL choice: goal's structure is `/posts/[slug]`, `/authors/[id]`, `/categories/[slug]`; current app uses `/post/:slug`, `/author/:id`, `/categories/:slug`. No production traffic exists → align URLs with the goal (clean break, no redirects needed).

### D6. App Router structure

- `app/(public)/` layout: Navbar (server, client shell for mobile menu) + footer; `app/(admin)/` layout with guard (stub session check in change 1, NextAuth middleware later).
- Route handlers: `app/api/auth/[...nextauth]` (follow-up); Server Actions for admin save which call `revalidatePath` + `revalidateTag('posts')`.
- Keep `@/*` alias (point at project root per Next convention or keep `src/` root — decide in design).

### D7. Image upload (defer to follow-up change)

- Vercel Blob (native to the Vercel stack, free tier, trivial API) vs Cloudinary (richer, external account) vs `public/` route handler (dev-only). Recommend Vercel Blob when it lands; not part of the first change.

### D8. Next.js version pin

- Goal targets **Next.js 14**. Next 15/16 changed request APIs (`params`/`searchParams` become async) and Auth.js pairing differs. Recommendation: pin `next@^14.2` to match the portfolio syllabus and the Auth.js v5 documentation era; a version bump is a deliberate follow-up decision, not a migration-side-effect.

## Recommendation

**Scope of the first change: the framework migration with parity + SSR/SSG/ISR + SEO baseline. Everything else ships as its own change.**

The full goal (auth, Prisma, SEO, uploads, fulltext, deploy/CI) in one change would be several thousand lines and multiple conflicting concerns — a guaranteed review-budget violation. Slice it:

- **This change (`migrate-nextjs-app-router`)**: Next.js 14 App Router scaffold; `(public)` pages as Server Components with SSG/ISR per D3; admin ported as client components under `(admin)` (still unauthenticated — no regression); **SEO baseline (D5)** since it is the primary goal of the portfolio; markdown per D4 option 1; URL alignment; `loading/error/not-found` per segment; Tailwind v4 + shadcn port.
- **Data layer in this change: Prisma over the existing Supabase Postgres (D2 option 1).** Rationale: redoing RSC pages twice (Supabase interim → Prisma) is wasted effort, and option 1 preserves the seed data while still learning Prisma end-to-end. Accept the pooling gotcha and the RLS dead-weight (both flagged below).
- **Follow-up changes** (each its own SDD cycle): NextAuth + protected admin + RLS tightening; image upload (Vercel Blob); fulltext search (tsvector); editor upgrade (optional MDX); Vercel deploy + GitHub Actions CI + git repo init (git init should actually happen **now**, before lines are rewritten).

Effort overall: **High** in aggregate; per-change Medium. Even change 1 is likely to exceed the 400-line review budget → plan chained PRs (orchestrator decision in sdd-tasks).

## Risks

- **No git repo** — the migration rewrites nearly every file with zero versioning/rollback. Init git and commit the current SPA state BEFORE change 1.
- **No tests/lint/CI** — verification will be manual (sdd-init confirms no test runner); regression risk on a full-page rewrite. sdd-verify will need a manual checklist.
- **Prisma + Supabase pooling semantics** — use direct connection (5432) for migrations, pooled (6543, pgbouncer) for serverless runtime; wrong URL = prod-visible timeouts.
- **RLS open policies become bypassed** by the direct DB connection — security debt until the auth change; do not advertise the service key path via client envs (server-only env vars).
- **Client-side `views` counter** breaks the SSG/ISR model — must move to a route handler/action, else static pages never see updates or increment oddly.
- **Next version drift** — Next 15+/16 APIs differ from 14; pin `next@^14.2` per the goal, decide upgrades deliberately.
- **react-markdown RSC compatibility** — avoided by the server-side remark/rehype pipeline (D4 option 1); verify at design time if preview must render server-side.
- **Tailwind v4 + Next 14** — requires `@tailwindcss/postcss` wiring; validate early with a smoke test page (shadcn `components.json` regeneration included).
- **Env var churn** — `VITE_` → `NEXT_PUBLIC_*`/server-only; missing `.env` files today means zero secrets exist to leak, but the new app will need `.env.local` + documentation.

## Ready for Proposal

**Yes** — enough is known to write a proposal. The orchestrator should tell the user:
1. The first change = framework + SSR/SSG/ISR + SEO baseline + Prisma over the existing Supabase Postgres; auth/uploads/fulltext/deploy/CI are separate follow-up changes.
2. Init a git repo and commit the current SPA before any code is touched.
3. Pin Next.js 14 (not 15/16) to match the goal syllabus; confirm that choice and the auth provider (GitHub OAuth vs credentials) at proposal time.
4. Expect chained PRs: even the scoped change will exceed a single 400-line review budget.