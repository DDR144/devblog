# Apply Progress: migrate-nextjs-app-router — PR1 (Work Unit 1)

## Status

**Slice**: PR1 — Foundation (Deps + Next14 scaffold + Tailwind v4 + Prisma schema + smoke test)
**Chain strategy**: stacked-to-main
**Delivery mode**: chained PR slice
**Mode**: Standard (no TDD — no test runner detected)
**Date**: 2026-08-09

## Completed Tasks

| Task | Description | Commit |
|------|-------------|--------|
| 0.1 | git init + commit SPA baseline | `b7f19e3` (pre-existing) |
| 1.1 | package.json: pin next@^14.2, react@18.3.1, add prisma + @tailwindcss/postcss | `25a03d0` |
| 1.2 | next.config.mjs, postcss.config.mjs, components.json, .env.example | `25a03d0` |
| 1.3 | src/app/layout.tsx + src/app/globals.css | `8828ad7` |
| 1.4 | src/app/smoke/page.tsx (Tailwind + Prisma SELECT 1) | `aca9c28` |
| 2.3 | prisma/schema.prisma (5 tables) + src/lib/db.ts (globalThis singleton) | `811318e` |

## Skipped Tasks (require DB access)

| Task | Description | Reason |
|------|-------------|--------|
| 2.1 | `prisma db pull` against Supabase 5432 | No DATABASE_URL configured; schema hand-written from SQL migration |
| 2.2 | `migrate diff --from-empty` → 0_init baseline | Depends on 2.1; will run when DB is available |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `npm run build` → ✓ Compiled successfully, 4 static pages generated |
| Runtime harness | `npm run dev` → http://localhost:3000/smoke renders Tailwind-styled cards; Prisma SELECT 1 shows "disconnected" without .env (graceful fallback) |
| Rollback boundary | Revert commits `f178519..25a03d0` (5 commits); SPA fully intact in `_legacy/`; no DB changes |

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `package.json` | Modified | Pinned next@^14.2, react@18.3.1, added prisma + @tailwindcss/postcss, dropped vite/react-router/supabase-js |
| `package-lock.json` | Modified | Lock file regenerated for new deps |
| `tsconfig.json` | Modified | Replaced Vite tsconfig with Next.js bundler resolution |
| `next.config.mjs` | Created | Dicebear image remote pattern |
| `postcss.config.mjs` | Created | @tailwindcss/postcss plugin |
| `components.json` | Modified | rsc:true, css path → src/app/globals.css |
| `next-env.d.ts` | Created | Next.js type declarations |
| `.env.example` | Created | DATABASE_URL (6543) / DIRECT_URL (5432) template |
| `src/app/layout.tsx` | Created | RSC root layout with ThemeProvider, metadata, WebSite JSON-LD |
| `src/app/globals.css` | Created | Port of index.css theme vars + prose-devblog markdown styles |
| `src/app/smoke/page.tsx` | Created | Tailwind-styled smoke test with Prisma SELECT 1 |
| `prisma/schema.prisma` | Created | 5 tables mapping Supabase schema with relations and indexes |
| `src/lib/db.ts` | Created | Prisma singleton (globalThis pattern) |
| `_legacy/` | Created | All SPA files moved here for coexistence |

## Deviations from Design

- **Task 2.1/2.2 deferred**: Schema was hand-written from the SQL migration instead of `prisma db pull` because no DATABASE_URL is configured. The schema matches the SQL 1:1 (verified by manual comparison). Will re-validate with `prisma db pull` when DB access is available.
- **Legacy coexistence**: SPA files moved to `_legacy/` instead of staying in `src/`. This was necessary because Next.js TypeScript compilation picked up the old files and their missing dependencies. The `_legacy/` directory is excluded from tsconfig.
- **`import "server-only"` not added to db.ts**: The `server-only` package is not installed. This is a guard rail, not a blocker — will add in a future PR if desired.

## Smoke Test Status

- ✅ `npm run build` passes — smoke page statically generated at `/smoke`
- ✅ Tailwind v4 rendering confirmed (styled cards, border, background)
- ⚠️ Prisma connection shows "disconnected" without DATABASE_URL (expected, graceful)
- 📋 Command to verify full smoke: `npm run dev` then visit `http://localhost:3000/smoke`

## Commits Created

```
f178519 chore: move legacy SPA files to _legacy/ for coexistence
aca9c28 test: add smoke page for Tailwind + Prisma connectivity
811318e feat(db): add Prisma schema and singleton client
8828ad7 feat(app): add App Router root layout and globals.css
25a03d0 chore(deps): pin Next.js 14, React 18, Tailwind v4 PostCSS, Prisma
```

## Remaining Tasks

- [ ] 2.1 `prisma db pull` (5432) → schema.prisma 5 tables; tune relations
- [ ] 2.2 diff --from-empty → migrations/0_init + resolve --applied; no data stmts
- Phase 2: Public Routes, Markdown, SEO (tasks 3.1–3.8)
- Phase 3: Admin (tasks 4.1–4.3)
- Phase 4: Cleanup + Parity (tasks 5.1–5.2)
