# Proposal: Migrate to Next.js 14 App Router

## Intent (Problem & Goal)

Personal dev blog, single author, dev blog personal tone. Current client-side SPA (React 19 + Vite + react-router + Supabase anon client) has no server layer, no SEO (static "shadcn/ui" title), no git repo, open RLS — it does not match the portfolio goal: Next.js 14 App Router with SSR/SSG/ISR and Server/Client Components.

**Goal**: framework migration with functional parity + rendering architecture (primary interview priority) + dynamic SEO baseline (secondary, still in change 1) + Prisma over the existing Supabase Postgres, preserving all seed data.

## Scope

### In Scope
- Next.js 14 scaffold (pin `next@^14.2`), App Router route tree, Tailwind v4 (`@tailwindcss/postcss`) + shadcn port.
- Public pages as Server Components: Home SSG+ISR; post detail SSG (`generateStaticParams`) + ISR; categories/authors SSG+ISR; `loading/error/not-found` per segment; `'use client'` only where interactive.
- Views counter moved to route handler/Server Action (SSG-compatible).
- Admin under `(admin)`: textarea + preview toggle editor, Server-Action save + `revalidateTag('posts')`; single admin, no roles; still unauthenticated (no regression).
- SEO: `generateMetadata` (Article/Profile/CollectionPage), JSON-LD, `sitemap.ts`/`robots.ts`, `next/image`, canonical URLs `/posts/[slug]`, `/authors/[id]`, `/categories/[slug]`.
- Prisma over **same** Supabase Postgres: introspect + baseline migration, keep seed (1 author, 5 categories, 10 tags, 5 posts) — NO data recreation. Pooling: 5432 migrations / 6543 serverless runtime.
- Markdown: server-side remark+rehype pipeline for public pages; react-markdown only in admin preview.
- Git init + baseline commit of current SPA BEFORE any rewrite.

### Out of Scope / Non-Goals
- Auth (NextAuth v5) — separate change; single admin only, deferred coherently.
- Image upload / covers (Vercel Blob) — separate change; `cover_image` stays a URL.
- Fulltext tsvector search; editor upgrade / MDX — separate changes.
- Vercel deploy + CI — separate change.
- No destructive DB changes, no new data.

## Capabilities

### New Capabilities
- `blog-rendering`: Server/Client Component split; SSG/ISR strategy per route; segment loading/error/not-found.
- `blog-admin`: admin list/editor (textarea + preview toggle); Server Actions + revalidation.
- `post-views`: server-side view increment compatible with static output.
- `seo`: metadata, JSON-LD, sitemap/robots, image optimization, canonical URLs.
- `prisma-data-access`: Prisma schema + client singleton, baseline migration, connection strategy.

### Modified Capabilities
None (no existing specs).

## Approach

Pin `next@^14.2`; Prisma direct over existing Supabase Postgres (preserves seed, no rework); rendering per route (above); server-side markdown pipeline; admin as client components; init git + baseline commit first; align URLs with the goal (no traffic → clean break).

## Options Considered

| Option | Tradeoff | Verdict |
|---|---|---|
| Auth: NextAuth vs Supabase vs defer | defer keeps admin public (same as today — no regression) | Defer |
| DB: Prisma direct Supabase vs Docker re-seed vs supabase-js interim | direct preserves seed, zero infra; interim = double work | Prisma direct |
| Markdown: server remark/rehype vs client vs MDX | server = zero JS for article body; MDX overkill | Server pipeline |
| Next 14 pin vs 15/16 | 15/16 async request APIs differ; 14 matches syllabus | Pin `^14.2` |

## Expected Outcomes

- Interview-demonstrable: SSG/ISR + Server/Client architecture visible in code and build output.
- Portfolio parity: App Router + dynamic SEO + PostgreSQL/Prisma, zero data loss.
- SEO baseline shipped (secondary goal): per-page titles/OG, JSON-LD, sitemap.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `app/` tree, `next.config.mjs`, `package.json` | New | replaces `src/pages`, Vite config |
| `lib/db.ts`, `prisma/schema.prisma` | New | from `src/lib/supabase.ts` + migrations |
| `src/components/*` | Modified | server/client split; `ui/*` ported |
| `public/`, env | Modified | `NEXT_PUBLIC_*`/server-only vars; `.env.local` |

## Risks & Mitigations

| Risk | L | Mitigation |
|---|---|---|
| No git repo | High | git init + baseline commit before rewrite |
| No tests/lint/CI (manual verify) | High | manual checklist in sdd-verify |
| Prisma+Supabase pooling misconfig | Med | 5432 migrate / 6543 runtime; documented |
| RLS open bypassed by direct DB | Med | server-only env vars; tighten in auth change |
| Next version drift | Med | pin `^14.2`; deliberate upgrades |
| Tailwind v4 + Next 14 wiring | Med | early smoke-test page |

## Rollback Plan

Baseline git commit = restore point; revert commits to return to the SPA. DB untouched (introspection read-only; baseline migration records history only). Old SPA stays runnable until parity confirmed.

## Dependencies

- Git init + baseline commit (prereq).
- Supabase `DATABASE_URL` (5432) + pooled URL (6543) in `.env.local`.
- `next@^14.2`; `@tailwindcss/postcss` for Tailwind v4.

## Success Criteria

- [ ] `npm run build` passes; public pages static (Σ/○) in build output, admin dynamic (ƒ).
- [ ] All 9 routes ported with functional parity; 5 seeded posts via `generateStaticParams`.
- [ ] Views increment without client JS breaking static pages.
- [ ] Per-page metadata + JSON-LD + `sitemap.xml`/`robots.txt` present; canonical URLs aligned.
- [ ] Admin CRUD works; save triggers `revalidateTag('posts')`.
- [ ] Seed intact (1/5/10/5); no data recreated.

## Open Points (non-blocking)

- `@/*` alias root (`src/` vs project root) → design phase.
- Change likely exceeds 400-line review budget → chained PRs planned in sdd-tasks.