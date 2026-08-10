# Tasks: Migrate to Next.js 14 App Router

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~2,800–3,200 (+~400 deletions) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Foundation → PR2 Prisma → PR3 Public+SEO → PR4 Admin → PR5 Cleanup |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| # | Goal / files | ~Δ lines | PR | Focused test | Runtime harness | Rollback |
|---|---|---|---|---|---|---|
| 0 | git init + SPA baseline commit (manual prereq) | 0 | — | `git status` clean | `git log` baseline | n/a |
| 1 | Deps + Next14 scaffold + Tailwind v4 wiring (package.json, next.config.mjs, postcss.config.mjs, .env, layout, globals.css, smoke page) | 380 | PR 1 | `npm run build` | `npm run dev` + /smoke styled, SELECT 1 | revert (SPA intact) |
| 2 | Prisma baseline (schema.prisma pull+relations, 0_init, seed.ts, lib/db.ts) | 300 | PR 2 | `prisma migrate status`; seed 1/5/10/5 | db pull 5432 + dev query | revert; history-only |
| 3 | Public RSC+SEO: lib/markdown, lib/seo, page.tsx, posts/categories/authors, sitemap, robots, components, next/image, views increment | 1,100 | PR 3 | `npm run build` Σ/○, 5 slugs | `npm run start`: view+1, JSON-LD, no client scripts | revert; DB untouched |
| 4 | Admin CRUD: app/admin, actions.ts, PostEditor, ui clients | 800 | PR 4 | build admin ƒ | CRUD → revalidate reflects | revert |
| 5 | Delete SPA files, parity + docs | 350 (del) | PR 5 | `npm run build`; no vite refs | full 9-route walk | baseline commit |

## Phase 1: Foundation
- [x] 0.1 git init + commit SPA baseline before any change
- [x] 1.1 package.json: pin next@^14.2, react/react-dom@18.3.1 + @types/react@18, add prisma + @tailwindcss/postcss; drop vite, react-router, supabase-js
- [x] 1.2 next.config.mjs (dicebear images), postcss.config.mjs, components.json (globals.css, rsc:true), .env (6543/5432, no NEXT_PUBLIC)
- [x] 1.3 src/app/layout.tsx (ThemeProvider+Navbar, WebSite JSON-LD) + globals.css (index.css + prose)
- [x] 1.4 smoke: src/app/smoke/page.tsx Tailwind class + Prisma SELECT 1; `npm run build` green
- [ ] 2.1 `prisma db pull` (5432) → schema.prisma 5 tables; tune relations
- [ ] 2.2 diff --from-empty → migrations/0_init + resolve --applied; no data stmts
- [x] 2.3 lib/db.ts singleton (globalThis+server-only); seed.ts idempotent (email/slug), never auto-run

## Phase 2: Public Routes, Markdown, SEO
- [ ] 3.1 lib/markdown.ts server pipeline (remark→gfm→rehype-sanitize→highlight→stringify)
- [ ] 3.2 lib/seo.ts builders; utils.ts port (cn, slugify, readingTime, formatDate)
- [ ] 3.3 app/page.tsx SSG (dynamic on q/category/tag searchParams), queries in unstable_cache tag 'posts', revalidate 300
- [ ] 3.4 posts/[slug]: generateStaticParams(5), generateMetadata Article, JSON-LD, render-time views increment (D3), not-found()
- [ ] 3.5 categories/+[slug] y authors/[id]: SSG, CollectionPage/ProfilePage metadata, Person JSON-LD
- [ ] 3.6 sitemap.ts (all public URLs, lastmod), robots.ts; metadataBase/canonical
- [ ] 3.7 components: PostCard, ui server-safe set, Navbar/mode-toggle/theme-provider client, next/image covers/avatars
- [ ] 3.8 loading/error/not-found per segment; delete smoke page after 3.3-3.5

## Phase 3: Admin
- [ ] 4.1 admin/page.tsx RSC list (force-dynamic) + new/ + edit/[id]/ shells
- [ ] 4.2 actions.ts: create/update/delete (post_tags sync, reading_time) → revalidateTag('posts')
- [ ] 4.3 admin/PostEditor.tsx client (textarea + react-markdown preview); ui client port (select, dropdown-menu, sonner, tabs)

## Phase 4: Cleanup + Parity
- [ ] 5.1 delete src/pages, App.tsx, main.tsx, vite.config.ts, index.html, supabase/, Zone.Identifier
- [ ] 5.2 parity commit; verify 9 routes, metadata/JSON-LD/sitemap/robots, views no-client-JS, admin revalidation; README