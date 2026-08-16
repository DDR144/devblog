# Apply Progress: migrate-nextjs-app-router — PR1 + PR2

## Status

**Current slice**: PR2 — Prisma Baseline (migration + seed)
**Chain strategy**: stacked-to-main
**Delivery mode**: chained PR slice
**Mode**: Standard (no TDD — no test runner detected)
**Date PR1**: 2026-08-09
**Date PR2**: 2026-08-16

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

## Skipped Tasks (require DB access)

| Task | Description | Reason |
|------|-------------|--------|
| ~~2.1~~ | ~~`prisma db pull` against Supabase 5432~~ | DB was empty → `db pull` returns nothing. Schema hand-written from SQL migration, verified 1:1. Applied baseline from schema.prisma instead. |
| ~~2.2~~ | ~~`migrate diff --from-empty` → 0_init baseline~~ | Resolved in PR2 — migration generated and applied successfully. |

## Work Unit Evidence — PR2

| Evidence | Value |
|----------|-------|
| Focused test command | `npx prisma migrate status` → "Database schema is up to date!" |
| Runtime harness | `npx prisma db seed` → 1 author, 5 categories, 10 tags, 5 posts, 10 post_tags. Re-run idempotent (same IDs, no duplicates). |
| Rollback boundary | Revert commits `e88d731..7720f1e` (2 commits); DB tables dropped manually via Supabase dashboard if needed; PR1 code intact. |

## Files Changed — PR2

| File | Action | What Was Done |
|------|--------|---------------|
| `prisma/migrations/0_init/migration.sql` | Created | Baseline migration SQL (5 tables, indexes, FKs) |
| `prisma/migrations/migration_lock.toml` | Created | Provider lock (postgresql) |
| `prisma/seed.ts` | Created | Idempotent seed: upsert 1 author, 5 categories, 10 tags, 5 posts, 10 post_tags |
| `package.json` | Modified | Added `prisma.seed` config, added `tsx` devDep |
| `package-lock.json` | Modified | Lock file updated for tsx |
| `openspec/.../tasks.md` | Modified | Marked 2.1, 2.2, 2.3b complete |

## DB State After PR2

| Table | Count | Status |
|-------|-------|--------|
| authors | 1 | ✓ Alex Rivera |
| categories | 5 | ✓ Frontend, Backend, DevOps, TypeScript, Architecture |
| tags | 10 | ✓ React, TypeScript, Node.js, PostgreSQL, Docker, Performance, Testing, CSS, API Design, Security |
| posts | 5 | ✓ All published, views 567–2341 |
| post_tags | 10 | ✓ Junction records linking posts to tags |

Schema drift: **No drift detected** — `prisma migrate status` reports up to date. Schema.prisma matches the SQL migration 1:1 (verified by manual comparison in PR1, confirmed by successful baseline apply in PR2).

## Deviations from Design

- **`db pull` couldn't run (empty DB)**: The Supabase database had no tables when PR2 started. Instead of introspecting, we generated the baseline from `schema.prisma` (which was hand-verified against the SQL migration). This is correct — `db pull` is for existing databases, not empty ones.
- **`prisma migrate resolve --applied` not needed**: `prisma migrate deploy` applied the `0_init` migration directly and marked it as applied automatically.
- **`import "server-only"` not added to db.ts**: Deferred — not a blocker for PR2 scope.

## Commits Created (cumulative)

```
7720f1e feat(db): add idempotent seed script and wire prisma.seed config
e88d731 feat(db): add Prisma baseline migration for 5-table Supabase schema
716bcd6 chore: ignore local .env with Supabase credentials
7d72686 docs(sdd): fix task 2.3 paper-trail, defer seed.ts to PR2
11fae84 chore: track SPA removals and ignore Next build output
3aae016 docs(sdd): update tasks and add apply-progress for PR1 foundation
f178519 chore: move legacy SPA files to _legacy/ for coexistence
aca9c28 test: add smoke page for Tailwind + Prisma connectivity
811318e feat(db): add Prisma schema and singleton client
8828ad7 feat(app): add App Router root layout and globals.css
25a03d0 chore(deps): pin Next.js 14, React 18, Tailwind v4 PostCSS, Prisma
b7f19e3 chore: baseline del SPA DevBlog antes de la migración a Next.js
```

## Remaining Tasks

- Phase 2: Public Routes, Markdown, SEO (tasks 3.1–3.8)
- Phase 3: Admin (tasks 4.1–4.3)
- Phase 4: Cleanup + Parity (tasks 5.1–5.2)
