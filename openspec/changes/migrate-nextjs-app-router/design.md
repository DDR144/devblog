# Design: Migrate to Next.js 14 App Router

## Technical Approach

Port the Vite SPA to `next@^14.2` (pinned) with a `src/`-rooted App Router. Public pages are Server Components with SSG+ISR; interactivity isolated in `'use client'` islands. Data via Prisma over the existing Supabase Postgres — seed preserved, no data recreated. Markdown rendered server-side (remark→rehype), admin preview keeps client `react-markdown`. Git init + baseline commit before any rewrite. React **must** drop to 18.3.1 (Next 14 peer requirement; tree currently ships React 19).

## Architecture Decisions

| # | Decision | Options | Tradeoff | Choice |
|---|---|---|---|---|
| D1 | Alias `@/*` | `./src/*` vs project root | Root app/ adds churn (all components already in `src/`, tsconfig/components.json unchanged) | **Keep `src/` root**: `src/app/`, paths `"@/*": ["./src/*"]` unchanged; CNA/Next-14 & shadcn default |
| D2 | React version | 19 (current) vs 18.3.1 | Next 14.2 RSC requires React 18.x | **Pin `react@18.3.1` + `@types/react@18`**; deliberate bump later |
| D3 | Views counter | (a) render-time increment; (b) RH `POST /api/views/[slug]` + client island; (c) Server Action | (b)/(c) violate spec scenario "no client tracking/fetch in source"; (a) undercounts ISR cache hits | **(a) fire-and-forget `views: { increment: 1 }` in post page render** — spec wants zero client JS; count refreshes on next regeneration. **No `revalidateTag` per view** (would rebuild page per visit — the tag loop); tag invalidation stays admin-only |
| D4 | Markdown | server pipeline vs react-markdown RSC vs MDX | react-markdown v10 incompatible with RSC (client-only); MDX overkill | **Server pipeline** `remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-highlight → rehype-stringify` in `lib/markdown.ts`; HTML via `dangerouslySetInnerHTML` (sanitized); styled by `.prose-devblog` CSS in `globals.css` (port of current classes) |
| D5 | Prisma strategy | direct-only vs pooler split | Supabase serverless needs PgBouncer; migrate via pooler fails | **`DATABASE_URL` = 6543 pooled (`?pgbouncer=true&connection_limit=1`) runtime; `DIRECT_URL` = 5432 for `migrate`/`db pull`**. Baseline: `db pull` → hand-tune relations → `migrate diff --from-empty` → `migrate resolve --applied` (no data touched) |
| D6 | Revalidation model | multi-tag vs single tag | Category/author pages also list posts; per-entity tags = invalidation-matrix bugs | **Single tag `'posts'` on every public Prisma query via `unstable_cache`**; admin Server Actions call `revalidateTag('posts')` only. No per-view invalidation (D3) |
| D7 | Admin route shape | `(admin)` route group vs literal folder | Group is URL-transparent: `(admin)/new` = `/new`, not `/admin/new` | **Literal `app/admin/` folder** (list/new/edit), same global shell as SPA today (Navbar/footer at root layout — parity); group refactor paired with future auth |
| D8 | Tailwind v4 wiring | Vite plugin (gone) vs PostCSS | Next 14 has no Vite Tailwind plugin | **`@tailwindcss/postcss`** in `postcss.config.mjs` + `src/app/globals.css` (current `index.css` content + prose styles); zero-config (v4); `components.json` css → `src/app/globals.css`, `rsc: true` |

## Rendering per Route (SSG/ISR)

| Route | Render | Revalidate | Cache tag | Data |
|---|---|---|---|---|
| `/` | SSG; dynamic when `searchParams` (q/category/tag) | 300s | `posts` | posts (published, w/ author/category/tags), categories, tags |
| `/posts/[slug]` | SSG `generateStaticParams` (5 seeded) + `not-found()` | 300s | `posts` | post + relations; render-time views increment |
| `/categories`, `/categories/[slug]` | SSG `generateStaticParams` | 300s | `posts` | categories + post counts |
| `/authors/[id]` | SSG `generateStaticParams` | 300s | `posts` | author + posts |
| `/admin/*` | dynamic (`force-dynamic`) | — | none | fresh reads |

## Folder Structure & Component Map

```
src/
  app/
    layout.tsx        RSC root: html/body, ThemeProvider (client), Navbar (client), footer, metadataBase/template, WebSite JSON-LD
    globals.css  sitemap.ts  robots.ts
    page.tsx          RSC home (↑ table)
    loading.tsx  error.tsx  not-found.tsx
    posts/[slug]/     page.tsx (RSC: data, generateMetadata Article, JSON-LD, increment) + loading/error/not-found
    categories/       page.tsx + [slug]/page.tsx   (RSC, generateMetadata CollectionPage)
    authors/[id]/     page.tsx                     (RSC, generateMetadata ProfilePage, Person JSON-LD)
    admin/            page.tsx (RSC list)  new/page.tsx  edit/[id]/page.tsx — page shells RSC, editor form client
    actions.ts        'use server' create/update/delete Post (+ post_tags sync, reading_time) → revalidateTag('posts')
  components/
    Navbar.tsx  mode-toggle.tsx  theme-provider.tsx   'use client' (state/hooks)
    PostCard.tsx  ui/button, badge, skeleton, card, input, label, textarea    server-safe (no hooks)
    ui/avatar, select, dropdown-menu, sonner, tabs     'use client' (radix)
    admin/PostEditor.tsx  'use client' — form + react-markdown preview toggle (MarkdownRenderer moved here)
  lib/
    db.ts             Prisma singleton (globalThis) + `import "server-only"`
    markdown.ts       server pipeline (D4)
    seo.ts            metadata + JSON-LD builders
    utils.ts          keep cn/slugify/estimateReadingTime/formatDate
prisma/schema.prisma  seed.ts  migrations/0_init/migration.sql (baseline)
next.config.mjs       images.remotePatterns: api.dicebear.com
postcss.config.mjs    { plugins: { '@tailwindcss/postcss': {} } }
.env                  DATABASE_URL (6543) / DIRECT_URL (5432) — no NEXT_PUBLIC prefix
```

## Data Flow

```
Browser ── HTTP ──▶ Next (RSC render)
  └─ static hit ──▶ CDN cache (unstable_cache+ISR, tag 'posts')
  └─ admin POST ──▶ Server Action ──▶ Prisma (pooler 6543) ──▶ Supabase Postgres
                        └──▶ revalidateTag('posts') ──▶ cache rebuild
  migrate/db pull ──▶ DIRECT_URL (5432, bypass pooler)
```

## Interfaces / Contracts

```prisma
model Author   { id String @id @default(uuid())  posts Post[] }         // + name/email/bio/avatar_url/github/twitter/created_at
model Category { id String @id @default(uuid())  posts Post[] }         // + name/slug/description/color
model Tag      { id String @id @default(uuid())  post_tags PostTag[] }  // + name/slug
model Post     { id String @id @default(uuid())  author_id? category_id? status String @default("draft")
                 views Int @default(0)  authors?  categories?  post_tags PostTag[] }  // slug unique; reading_time/published_at/… per SQL
model PostTag  { post_id tag_id  post Post @relation(...)  tag Tag @relation(...)  @@id([post_id, tag_id]) }
```
`status` stays **String** (DB CHECK constraint, not enum) — avoids alter-migration drift. Cache contract: every public query wrapped `unstable_cache(fn, [key], { tags: ['posts'], revalidate: 300 })`. Seed (`prisma/seed.ts`, `tsx`) idempotent on unique keys (author email, slug); wired via `prisma.seed` in package.json, never run by `migrate deploy`.

## Testing Strategy

No test runner (sdd-init none) — manual verification checklist:

| Layer | What | How |
|---|---|---|
| Smoke | Tailwind+Next wiring, Prisma connect | temp `app/smoke/page.tsx` rendering `SELECT 1` + styled class; `npm run build` green; deleted after D8 pages land |
| Build | Route output types | `npm run build`: public pages Σ/○, admin ƒ; `generateStaticParams` = 5 slugs |
| Verify | Views | visit post once in prod build → count +1, no client scripts in HTML |
| Verify | Admin | save → revalidate → home/detail show update |
| Verify | SEO | per-page `<title>`/OG, JSON-LD Article/Person, `sitemap.xml` (incl. `/ ?tag=` URLs), `robots.txt`, canonical |

## Threat Matrix

N/A — no agent routing/shell/subprocess/VCS/PR-automation/executable-classification boundary: next/Prisma CLIs are standard dev tooling, git init is a one-time manual prereq (no automation), web routes are app-level.

## Migration / Rollout

1. `git init` + baseline commit of SPA. 2. Scaffold/migrate deps (React 18 pin, drop vite/react-router/supabase-js). 3. Smoke page (D8). 4. Prisma baseline (D5). 5. Public RSC routes + SEO. 6. Admin + actions. 7. Delete SPA files → parity confirmed commit. DB untouched throughout; old SPA runnable until step 7.

## Open Questions

- None blocking — one tag `'posts'` chosen; exact per-view counting (RH + client island) explicitly deferred as follow-up.