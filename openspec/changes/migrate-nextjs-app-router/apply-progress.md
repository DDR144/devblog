# Apply Progress: migrate-nextjs-app-router — PR1 + PR2 + PR3

## Status

**Current slice**: PR3 — Public Routes, Markdown, SEO
**Chain strategy**: stacked-to-main
**Delivery mode**: chained PR slice
**Mode**: Standard (no TDD — no test runner detected)
**Date PR1**: 2026-08-09
**Date PR2**: 2026-08-16
**Date PR3**: 2026-08-16

## Completed Tasks — PR1 (Work Unit 1)

| Task | Description | Commit |
|------|-------------|--------|
| 0.1 | git init + commit SPA baseline | `b7f19e3` (pre-existing) |
| 1.1 | package.json: pin next@^14.2, react@18.3.1, add prisma + @tailwindcss/postcss | `25a03d0` |
| 1.2 | next.config.mjs, postcss.config.mjs, components.json, .env.example | `25a03d0` |
| 1.3 | src/app/layout.tsx + src/app/globals.css | `8828ad7` |
| 1.4 | src/app/smoke/page.tsx (Tailwind + Prisma SELECT 1) | `aca9c28` |
| 2.3a | prisma/schema.prisma (5 tables) + src/lib/db.ts (globalThis singleton) | `811318e` |

## Completed Tasks — PR2 (Work Unit 2)

| Task | Description | Commit |
|------|-------------|--------|
| 2.1 | `prisma db pull` → schema comparison (DB empty, drift resolved) | `e88d731` |
| 2.2 | `migrate diff --from-empty` → `prisma/migrations/0_init/migration.sql` + applied | `e88d731` |
| 2.3b | `prisma/seed.ts` idempotent (upsert by email/slug) + `prisma.seed` wired in package.json | `7720f1e` |

## Completed Tasks — PR3 (Work Unit 3)

| Task | Description | Commit |
|------|-------------|--------|
| W1 | Capture migration: RLS (5 tables), CHECK on posts.status, update_updated_at trigger | `e5ef5fe` |
| 3.1 | lib/markdown.ts server pipeline (remark→gfm→rehype-sanitize→highlight→stringify) | `17612bb` |
| 3.2 | lib/seo.ts builders (post/author/category metadata + JSON-LD); lib/utils.ts (cn, slugify, readingTime, formatDate, toISOString) | `17612bb` |
| 3.3 | app/page.tsx SSG (dynamic with q/category/tag searchParams, unstable_cache tag 'posts', revalidate 300) | `cb183c9` |
| 3.4 | posts/[slug]/page.tsx: generateStaticParams(5), generateMetadata Article, Article JSON-LD, render-time views increment (D3), not-found() | `31f689c` |
| 3.5 | categories/[slug]/page.tsx + authors/[id]/page.tsx: SSG, CollectionPage/ProfilePage metadata, Person JSON-LD, generateStaticParams | `572c3ca` |
| 3.6 | sitemap.ts (all public URLs with lastmod), robots.ts | `d1406bb` |
| 3.7 | components: PostCard, Navbar, mode-toggle, theme-provider, ui set (button, badge, card, skeleton) | `3027bab` |
| 3.8 | loading/error/not-found per segment; delete smoke page | `72a1ed7` |

## Skipped Tasks (require DB access)

| Task | Description | Reason |
|------|-------------|--------|
| ~~2.1~~ | ~~`prisma db pull` against Supabase 5432~~ | DB was empty → `db pull` returns nothing. Schema hand-written from SQL migration, verified 1:1. Applied baseline from schema.prisma instead. |
| ~~2.2~~ | ~~`migrate diff --from-empty` → 0_init baseline~~ | Resolved in PR2 — migration generated and applied successfully. |

## Work Unit Evidence — PR3

| Evidence | Value |
|----------|-------|
| Focused test command | `npm run typecheck && npm run build` → exit 0, all routes generated |
| Runtime harness | `npm run build`: 18 static pages, 5 post slugs, 5 category slugs, 1 author, sitemap.xml, robots.txt. Smoke page removed. Views increment fires on render (D3). |
| Rollback boundary | Revert commits `e5ef5fe..72a1ed7` (8 commits); PR1+PR2 code intact; DB capture migration remains (idempotent, safe to keep). |

## Files Changed — PR3

| File | Action | What Was Done |
|------|--------|---------------|
| `prisma/migrations/2_capture_rls_check_trigger/migration.sql` | Created | Idempotent migration: RLS policies, CHECK constraint, updated_at trigger |
| `src/lib/markdown.ts` | Created | Server markdown pipeline (unified + remark + rehype) |
| `src/lib/seo.ts` | Created | Metadata + JSON-LD builders for posts, authors, categories |
| `src/lib/utils.ts` | Modified | Added toISOString helper; existing cn/slugify/readingTime/formatDate |
| `src/app/page.tsx` | Created | Home page with searchParams filtering, unstable_cache queries |
| `src/app/posts/[slug]/page.tsx` | Created | Post detail: SSG, generateMetadata, JSON-LD, views increment |
| `src/app/posts/[slug]/not-found.tsx` | Created | 404 for invalid post slugs |
| `src/app/posts/[slug]/loading.tsx` | Created | Skeleton loading for post detail |
| `src/app/posts/loading.tsx` | Created | Skeleton loading for posts list |
| `src/app/categories/page.tsx` | Created | Categories index with post counts |
| `src/app/categories/[slug]/page.tsx` | Created | Category detail: SSG, CollectionPage metadata |
| `src/app/categories/loading.tsx` | Created | Skeleton loading for categories |
| `src/app/authors/[id]/page.tsx` | Created | Author detail: SSG, Person JSON-LD, ProfilePage metadata |
| `src/app/sitemap.ts` | Created | Dynamic sitemap: all public routes with lastmod |
| `src/app/robots.ts` | Created | Robots.txt: allow all, reference sitemap |
| `src/app/loading.tsx` | Created | Root loading skeleton |
| `src/app/error.tsx` | Created | Root error boundary with retry |
| `src/app/not-found.tsx` | Created | Root 404 page |
| `src/app/layout.tsx` | Modified | Extracted inline nav → Navbar component |
| `src/components/Navbar.tsx` | Created | Client navbar with mode-toggle |
| `src/components/PostCard.tsx` | Created | Server-safe post card with next/image |
| `src/components/mode-toggle.tsx` | Created | Client dark/light toggle via next-themes |
| `src/components/theme-provider.tsx` | Created | next-themes wrapper with 'use client' |
| `src/components/ui/button.tsx` | Created | Button primitive with variant + size |
| `src/components/ui/badge.tsx` | Created | Badge primitive |
| `src/components/ui/card.tsx` | Created | Card primitives (Card, CardHeader, CardTitle, etc.) |
| `src/components/ui/skeleton.tsx` | Created | Skeleton loading primitive |
| `src/app/smoke/page.tsx` | Deleted | Smoke page removed (real routes exist) |
| `package.json` | Modified | Added unified/remark/rehype dependencies |
| `openspec/.../tasks.md` | Modified | Marked 3.1–3.8 complete |

## Deviations from Design

- **`import "server-only"` not added to db.ts**: Still deferred — not a blocker for PR3 scope.
- **Categories route**: Design shows `/categories/[slug]`; spec mentions `/category/[slug]`. Followed design (literal `/categories/[slug]`). Added `/categories` index page not in original spec but needed for discoverability.
- **Date serialization through unstable_cache**: Prisma Date objects serialize as strings through `unstable_cache`. Added `toISOString()` helper that handles both Date and string inputs. Applied across all pages.
- **Capture migration idempotent**: Original Supabase migration uses plain `ADD CONSTRAINT` / `CREATE POLICY`. Wrote PR3 migration with `DO $$ ... IF NOT EXISTS` blocks to be safe on re-apply.

## Commits Created (cumulative — PR3 slice)

```
2b2d064 docs(sdd): mark Phase 2 tasks 3.1–3.8 complete in tasks.md
72a1ed7 feat(app): add loading/error/not-found boundaries and remove smoke page
d1406bb feat(seo): add sitemap.xml and robots.txt generation
572c3ca feat(app): add category and author pages with SSG and JSON-LD
31f689c feat(app): add post detail page with SSG, JSON-LD, and views increment
cb183c9 feat(app): add home page with SSG, search params, and unstable_cache
3027bab feat(ui): add PostCard, Navbar, theme-provider, and ui component set
17612bb feat(lib): add markdown pipeline, SEO builders, and utility functions
e5ef5fe feat(db): capture RLS, CHECK constraint, and updated_at trigger in Prisma baseline
```

## Remaining Tasks

- Phase 3: Admin (tasks 4.1–4.3)
- Phase 4: Cleanup + Parity (tasks 5.1–5.2)

## Build State After PR3

| Metric | Value |
|--------|-------|
| Typecheck | ✅ `tsc --noEmit` exit 0 |
| Build | ✅ `next build` exit 0 |
| Static pages | 18 (home dynamic, 5 posts, 5 categories index+detail, 1 author, sitemap, robots, not-found) |
| Smoke page | Deleted |
| Routes | `/` (dynamic), `/posts/[slug]` (SSG×5), `/categories` (static), `/categories/[slug]` (SSG×5), `/authors/[id]` (SSG×1), `/sitemap.xml`, `/robots.txt` |
| Net lines (excl. lockfiles) | ~1,371 |
| Commits (PR3) | 9 |
