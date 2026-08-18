```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:e6b39ddfa571c862a210ff5eb3a3f30fb4544f4c20453eaa053d53b4c7e6f40f
verdict: fail
blockers: 0
critical_findings: 0
requirements: 3/23
scenarios: 7/42
test_command: npx prisma migrate status && npx prisma db seed
test_exit_code: 0
test_output_hash: sha256:3e16471929f248e0174eff5f0a0b6b340204ec5c4faa59b056830aa013139462
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:e6b39ddfa571c862a210ff5eb3a3f30fb4544f4c20453eaa053d53b4c7e6f40f
```

## Verification Report

**Change**: migrate-nextjs-app-router
**Slice**: PR1 — Foundation (Deps + Next14 scaffold + Tailwind v4 + Prisma schema + db singleton + smoke)
**Version**: N/A (delta specs, 5 files)
**Mode**: Standard (no TDD — no test runner detected)

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (change) | 18 |
| Tasks complete | 6 (PR1: 0.1, 1.1, 1.2, 1.3, 1.4, 2.3) |
| Tasks incomplete | 12 (PR2–PR5 + deferred 2.1, 2.2) |
| Slice scope | PR1 only — verdict below is scoped to PR1; PR2–PR5 are NOT implemented (expected) |

### Build & Tests Execution

**Build**: ✅ Passed (exit 0)
```text
▲ Next.js 14.2.35
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ✓ Generating static pages (4/4)
Route (app)                              Size     First Load JS
┌ ○ /_not-found                          873 B          88.1 kB
└ ○ /smoke                               138 B          87.4 kB
○  (Static)  prerendered as static content
```
Full exact build log preserved: `/tmp/opencode/pr1-build.log` (902 bytes, sha256 `a60e30aa…`).
`/smoke` prerendered static; no `/` home yet (PR3), no `/admin` (PR4) — expected for slice.

**Tests**: ➖ Not available — no test runner (sdd-init none); design replaces tests with manual verification checklist. Focused test for work unit 1 is `npm run build` (from tasks.md), which passes.

**Prisma validation**: `npx prisma validate` → ✅ valid when env vars supplied (`DATABASE_URL`/`DIRECT_URL` dummy). Fails with P1012 in a fresh checkout because no `.env` exists — expected, documented deviation (DB access deferred).

### Spec Compliance Matrix (slice-scoped)

Authoritative totals from the 5 retrieved delta specs: **23 requirements / 42 scenarios**. Only PR1-reachable rows are rated; the rest are deferred to PR2–PR5 (not slice verdict material).

| Requirement | Scenario | Evidence | Result |
|-------------|----------|----------|--------|
| PDA: Schema Reflects Existing Tables | Schema defines relations | Static 1:1 compare schema.prisma ↔ SQL (5 tables, fields, types, FKs, indexes, uniques) + `prisma validate` OK; `db pull` runtime deferred (task 2.1) | ⚠️ PARTIAL |
| PDA: Client Singleton | Singleton prevents multiple instances | `src/lib/db.ts` globalThis pattern; build green; hot-reload single-instance not runtime-proven | ⚠️ PARTIAL |
| PDA: Connection Pooling | Runtime queries use pooled connection | `.env.example` 6543 pgbouncer+connection_limit=1; schema `directUrl` = 5432; live query pending DB access | ⚠️ PARTIAL |
| PDA: Environment Variables | Env vars not in client bundle | No `NEXT_PUBLIC` anywhere in src/prisma/.env.example/config; grep + build evidence | ✅ COMPLIANT |
| PDA: Seed Script | Seed script exists and is idempotent | `prisma/seed.ts` DOES NOT EXIST; no `prisma.seed` in package.json — tasks.md marks 2.3 [x] including seed.ts | ❌ FAILING |
| BR: Server/Client Split | Public page renders as Server Component | `src/app/smoke/page.tsx` async RSC, zero `'use client'` in src/app|src/lib (grep); build static ○ | ✅ COMPLIANT |
| BR: Server/Client Split | Interactive element isolates to Client Component | `next-themes` ThemeProvider used as client boundary inside RSC layout; dedicated `mode-toggle`/`Navbar` components are PR3 (3.7) | ⚠️ PARTIAL |
| PDA: Schema introspects (db pull) / Baseline migration (2 scenarios) / Seed intact / BR SSG+ISR / BR loading-error / BR admin / post-views / seo / blog-admin | — | Deferred: tasks 2.1, 2.2 skipped (DB access), PR3–PR5 pending | — (out of slice) |

**Compliance summary (slice)**: 2/7 in-slice scenarios COMPLIANT, 4/7 PARTIAL, 1/7 FAILING; 35 scenarios deferred.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Deps: next@^14.2, react@18.3.1, prisma, @tailwindcss/postcss | ✅ Implemented | next ^14.2.29, react/react-dom ^18.3.1, @types/react ^18.3.23, prisma/@prisma/client ^6.15, @tailwindcss/postcss ^4.1.8; vite/react-router/supabase-js dropped (verified absent) |
| next.config.mjs (dicebear), postcss.config.mjs (@tailwindcss/postcss), components.json (rsc:true, css→globals.css) | ✅ Implemented | Matches design D8 |
| tsconfig `@/*` → `./src/*`; `_legacy` excluded | ✅ Implemented | Matches design D1; `"exclude": ["node_modules", "_legacy"]` |
| src/app/layout.tsx | ✅ Implemented | metadata default/template/description/**metadataBase**/openGraph + WebSite JSON-LD `<script type="application/ld+json">` + ThemeProvider + inline header/footer. Deviation: Navbar is inline markup, design expected client `Navbar` component (PR3 task 3.7) |
| src/app/globals.css | ✅ Implemented | `@import "tailwindcss"` + `tw-animate-css`; `@custom-variant dark`; `@theme inline` var mapping; `:root`/`.dark` oklch vars; `@layer base`; full `.prose-devblog` block — coherent with D4/D8 |
| src/app/smoke/page.tsx | ✅ Implemented | RSC async; Tailwind classes; `prisma.$queryRaw\`SELECT 1\`` with graceful "disconnected" fallback |
| prisma/schema.prisma (5 models) | ✅ Implemented | 1:1 vs SQL migration: authors/categories/posts/tags/post_tags, columns, types (uuid, timestamptz, text CHECK status), FK onDelete (SetNull/SetNull/Cascade), indexes incl. `published_at DESC`, uniques, composite PK; `status` kept String (design intent, avoids drift) |
| src/lib/db.ts | ✅ Implemented | globalThis singleton; no `import "server-only"` (documented deviation — package not installed; guard rail for later PR) |
| .env.example | ✅ Implemented | DATABASE_URL 6543 pooled / DIRECT_URL 5432 direct; no NEXT_PUBLIC prefix |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D1 alias @/* → ./src/* | ✅ Yes | tsconfig paths unchanged |
| D2 pin react@18.3.1 (+@types/react@18) | ✅ Yes | ^18.3.1 both |
| D5 directUrl 5432 / runtime 6543 | ✅ Yes | schema `directUrl` + .env.example; migrations not yet run (2.1/2.2) |
| D8 Tailwind v4 via @tailwindcss/postcss + globals.css + components.json rsc:true | ✅ Yes | All three artifacts present and wired |
| Layout contract (metadataBase/template, WebSite JSON-LD, ThemeProvider) | ✅ Yes | Present in layout.tsx |
| `import "server-only"` in db.ts (design line `lib/db.ts` spec) | ⚠️ Deviation | Documented in apply-progress; acceptable for slice, add with package later |
| Navbar as client component (design folder map) | ⚠️ Deviation | Inline header in layout; component extraction is PR3 task 3.7 |
| seed.ts wired via `prisma.seed` in package.json | ❌ Missing | Not implemented despite task 2.3 [x] — see issue W1 |

### Issues Found

**CRITICAL**: None for slice PR1.

**WARNING**:
1. **tasks.md overclaim (task 2.3)**: `[x] 2.3` includes "seed.ts idempotent (email/slug), never auto-run", but `prisma/seed.ts` and the `prisma.seed` package.json hook do not exist. apply-progress's task table does not list seed.ts as done or skipped. Paper-trail must be corrected (uncheck 2.3 or explicitly defer seed.ts to PR2) — spec PDA "Seed Script" scenario remains pending. Does not block PR1 merge (schema + db.ts are in and verified), but the [x] checkbox is factually wrong today.
2. **`prisma validate` fails in a fresh checkout** (P1012: `DIRECT_URL` not found): no `.env` at all, only `.env.example`. Expected under the documented DB-access deferral, but any Prisma CI/gate step will fail until a local `.env` is provided. Operational note for the pipeline, not a code defect.

**SUGGESTION**:
1. Layout ships an inline `<nav>` with an `/admin` link that 404s until PR4; acceptable for foundation, revisit when admin lands.
2. next-themes ThemeProvider is imported directly into the RSC layout (compiles/runs fine on Next 14 + next-themes 0.4.6); the conventional pattern is a `providers.tsx` `'use client'` wrapper — consider when PR3 adds `mode-toggle`.
3. `prisma` is declared with `^6.15.0` in both deps/devDeps while the installed CLI resolved 6.19.3; lockfile governs, but pin-check `prisma` vs `@prisma/client` minor alignment on install.
4. Zone.Identifier artifacts still at repo root (`.gitignore:Zone.Identifier`, `components.json:Zone.Identifier`, …) — already covered by PR5 task 5.1 cleanup.

### Verdict

**PASS WITH WARNINGS — scoped to slice PR1 (Foundation) only.**
Build green (exit 0); deps/config/layout/css/smoke/schema/db all verified against design; schema ↔ SQL migration is 1:1 with no drift found. Two non-blocking warnings: task 2.3 [x] overclaims seed.ts, and `prisma validate` needs a local `.env`. Full-change completion (5/23 requirements, 6/42 scenarios) is intentionally partial: PR2–PR5 are not implemented — this is expected for a chained-PR slice, not a failure.

---

## Verification Report — PR2 (Prisma Baseline)

**Change**: migrate-nextjs-app-router
**Slice**: PR2 — Prisma Baseline (baseline migration + idempotent seed)
**Version**: N/A (delta specs, 5 files)
**Mode**: Standard (no TDD — no test runner detected; manual checklist per design)
**Slice verdict**: **PASS WITH WARNINGS** (scoped to PR2). Full-change verdict: **FAIL (partial)** — PR3–PR5 pending, expected for the chain.

### Completeness (slice)

| Metric | Value |
|--------|-------|
| Slice tasks (WU2) | 3 (2.1, 2.2, 2.3b) |
| Tasks complete | 3 |
| Tasks incomplete in-slice | 0 |
| Tasks incomplete change-wide | 12 (3.1–3.8, 4.1–4.3, 5.1–5.2) |

### Build & Tests Execution (PR2)

**Build**: ✅ Passed (exit 0) — `/tmp/opencode/pr2-build.log` (sha256 `e6b39ddf…`); static `/smoke` + `/_not-found`, no regressions from PR2.
**Typecheck**: ✅ `npm run typecheck` (tsc --noEmit) exit 0 — `prisma/seed.ts` compiles clean.
**Prisma validate**: ✅ "The schema at prisma/schema.prisma is valid" (real `.env` present).
**Focused test** (`npx prisma migrate status`): ✅ exit 0 — "Database schema is up to date!" (connected via 5432 direct; credentials never printed).
**Idempotency harness** (`npx prisma db seed` re-run): ✅ exit 0 — all upserts no-op'd (`update: {}`), counts unchanged.

**Real DB state (Supabase project `veqwohhxykccffxjekxb`, live queries via PrismaClient):**

| Table | Expected | Before re-seed | After re-seed | Verdict |
|-------|----------|----------------|---------------|---------|
| authors | 1 | 1 | 1 | ✅ |
| categories | 5 | 5 | 5 | ✅ |
| tags | 10 | 10 | 10 | ✅ |
| posts | 5 | 5 | 5 | ✅ |
| post_tags | 10 | 10 | 10 | ✅ |
| duplicate emails | 0 | 0 | 0 | ✅ |
| duplicate slugs | 0 | 0 | 0 | ✅ |

Author row reused, not recreated: ID stable at `542e0d0b-cddd-48cf-a189-e7324d1b9a41` across seed runs. All 5 posts `status='published'` (views 567–2341, matching the reference seed dataset).

### Schema Drift — `prisma/migrations/0_init/migration.sql` vs `supabase/migrations/20260807004121_create_devblog_schema.sql`

| Aspect | Reference (Supabase) | Prisma baseline | Match |
|--------|----------------------|-----------------|-------|
| Tables | 5 (authors, categories, posts, tags, post_tags) | 5, same names | ✅ |
| Columns & types | uuid/text/int/timestamptz | 1:1 (`@db.Uuid`, TEXT, INTEGER, `@db.Timestamptz`) | ✅ |
| PKs | `id` PK ×4 + composite `(post_id, tag_id)` | Same | ✅ |
| FKs | author/category `ON DELETE SET NULL`; post_tags `CASCADE` | Same `ON DELETE`; adds `ON UPDATE CASCADE` (reference uses default NO ACTION) | ⚠️ micro-drift |
| Uniques | authors.email, categories.name/slug, tags.name/slug, posts.slug | Same (unique indexes) | ✅ |
| Indexes | posts: slug/status/published_at DESC/author_id/category_id + categories_slug_idx, tags_slug_idx | Same 5 posts indexes; categories/tags slug covered by unique indexes (redundant non-unique ones correctly omitted) | ✅ |
| Defaults | `gen_random_uuid()`, `''`, `'#6366f1'`, `'draft'`, 1, 0, `now()` | Same, except `id` default is client-side (`@default(uuid())` in Prisma) | ✅ |
| status CHECK (`IN ('draft','published')`) | Present | Absent from baseline file | ⚠️ |
| `update_updated_at` trigger | Present | Absent from baseline file | ⚠️ |
| RLS + anon policies (5 tables) | Present | Absent from baseline file | ⚠️ |
| Data statements | Seed `INSERT … ON CONFLICT` | **None** — DDL only (spec requirement) | ✅ |

**Conclusion**: types, relations, FKs, and primary indexes match 1:1; live DB shows **zero drift** (`migrate status` up-to-date, `validate` OK). The absences (CHECK, trigger, RLS) are DB-side artifacts Prisma migrations do not manage — they remain in the live DB from the original migration, so there is no live drift, but a fresh DB rebuilt from the Prisma baseline alone would lack them (and `updated_at` would go stale, since the schema also lacks `@updatedAt`).

### Spec Compliance Matrix (PR2 in-slice — prisma-data-access)

| Requirement | Scenario | Evidence | Result |
|-------------|----------|----------|--------|
| PDA: Schema Reflects Existing Tables | Schema introspects existing database | `db pull` not run — DB was empty at PR2 start; schema hand-written from reference SQL, verified 1:1, baseline applied from schema (documented substitution) | ⚠️ PARTIAL |
| PDA: Schema Reflects Existing Tables | Schema defines relations | schema.prisma: `Post`→`Author`/`Category` relations + m2m through `post_tags` (`PostTag`), 1:1 with SQL | ✅ COMPLIANT |
| PDA: Connection Pooling | Migrations use direct connection | `migrate status` via 5432 direct; baseline applied; up-to-date | ✅ COMPLIANT |
| PDA: Baseline Migration Preserves Seed Data | Baseline migration created | migration.sql = 111 lines pure DDL; zero INSERT/UPDATE/DELETE | ✅ COMPLIANT |
| PDA: Baseline Migration Preserves Seed Data | Seed data intact after migration | Live counts 1/5/10/5/10; no duplicates after re-seed | ✅ COMPLIANT |
| PDA: Seed Script | Seed script exists and is idempotent | `prisma/seed.ts` upserts by email/slug/composite-PK with `update: {}`; `prisma.seed` wired; `tsx` devDep; re-run proven idempotent (same IDs, same counts, exit 0) | ✅ COMPLIANT |

**Compliance summary (PR2 in-slice)**: 5/6 COMPLIANT, 1/6 PARTIAL (`db pull` — documented substitution).
**Cumulative (change)**: 7/42 scenarios COMPLIANT, 4 PARTIAL, 31 deferred (PR3–PR5); 3/23 requirements fully satisfied (PDA Baseline Migration, PDA Environment Variables, PDA Seed Script); 4 with partial evidence; 16 untouched.

### Correctness (Static Evidence, PR2)

| Item | Status | Notes |
|------|--------|-------|
| `prisma/migrations/0_init/migration.sql` | ✅ Implemented | 5 tables, PKs, 4 FKs, 6 unique indexes, 5 indexes; DDL only |
| `prisma/migrations/migration_lock.toml` | ✅ Implemented | provider `postgresql` |
| `prisma/seed.ts` | ✅ Implemented | Idempotent upserts; dataset 1:1 with reference seed (1 author / 5 categories / 10 tags / 5 posts / 10 post_tags) |
| `package.json` `prisma.seed` | ✅ Implemented | `"seed": "tsx prisma/seed.ts"` — not auto-run by migrate |
| `tsx` devDep | ✅ Implemented | `^4.23.12` in devDependencies |
| schema.prisma relations (task 2.1 intent) | ✅ Implemented | Matches design interface contract (D5) |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D5 directUrl 5432 / runtime 6543 | ✅ Yes | `migrate status` observed on 5432; schema `directUrl` + `.env` |
| Baseline captures schema history, no data touched | ✅ Yes | DDL only, applied as `0_init` |
| Seed wired via `prisma.seed`, never run by `migrate deploy` | ✅ Yes | Manual `prisma db seed` only |
| `status` stays String (avoid alter-migration drift) | ✅ Yes | String in schema; live CHECK retained from original migration |

### Issues Found (PR2)

**CRITICAL**: None.

**WARNING**:
1. **Baseline omits DB-side artifacts from the reference migration** — RLS (5 tables + anon policies), `posts.status` CHECK, `update_updated_at` trigger. Zero live drift today (all still present from the original migration; `migrate status` up-to-date), but a fresh DB rebuilt from Prisma migrations alone would lack them and `updated_at` would go stale (schema also lacks `@updatedAt`). Reproducibility/security-parity gap, not live drift.
2. **tasks.md paper-trail**: task `[x] 2.1` claims `prisma db pull`, which never executed (empty DB). apply-progress truthfully documents the substitution (hand-written schema verified 1:1 + baseline applied). Checkbox reflects task intent, not the literal command — same class of paper-trail imprecision flagged in PR1.

**SUGGESTION**:
1. Add `@updatedAt` to `Post.updatedAt` in schema.prisma — client does not maintain it today; the live trigger masks this, a fresh env would not.
2. `package.json#prisma` config is deprecated (removal in Prisma 7) — plan `prisma.config.ts` on the next Prisma bump; the warning appeared in every CLI run.
3. `ON UPDATE CASCADE` (Prisma default) vs NO ACTION (reference SQL) on all 4 FKs — behaviorally identical for immutable UUID PKs; accept or document.
4. If fresh-env parity matters, add a follow-up migration capturing RLS/CHECK/trigger. The omitted redundant `categories_slug_idx`/`tags_slug_idx` are covered by unique indexes — no action needed.

### Verdict

**PASS WITH WARNINGS — scoped to slice PR2 (Prisma Baseline).**
Migration matches the reference schema 1:1 on tables/types/relations/FKs/indexes with zero live drift (`migrate status` up-to-date, `validate` OK); seed proven idempotent at runtime (identical counts/IDs after re-run, zero duplicates); build + typecheck green. Two non-blocking warnings: fresh-env parity of RLS/CHECK/trigger in the baseline, and the 2.1 paper-trail.
**Full change: FAIL (partial, expected)** — 16/23 requirements and tasks 3.1–5.2 (PR3–PR5) remain unimplemented; the chain is not archive-ready until they land.---

## Verification Report — PR3 (Public Routes, Markdown, SEO)

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:905e69dc5e8386718a8615a71950aced2d32e2ca8d051552510a59fa974d1faa
verdict: fail
blockers: 1
critical_findings: 1
requirements: 10/23
scenarios: 23/42
test_command: npm run typecheck
test_exit_code: 0
test_output_hash: sha256:0efc9fd8ec61821817a633dd6c3c2c1efd9474fe68e11a06a839113da54e7333
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:905e69dc5e8386718a8615a71950aced2d32e2ca8d051552510a59fa974d1faa
```

**Change**: migrate-nextjs-app-router
**Slice**: PR3 — Public Routes, Markdown, SEO (tasks 3.1–3.8 + capture migration W1)
**Branches verified**: `feat/pr3c-seo-cleanup` (chains pr3a-foundation → pr3b-public-routes → pr3c-seo-cleanup)
**Version**: N/A (delta specs, 5 files — 23 requirements / 42 scenarios authoritative)
**Mode**: Standard (no TDD — no test runner detected; manual checklist per design)
**Slice verdict**: **FAIL** — code is functionally complete (17/23 in-slice scenarios COMPLIANT) but `npm run build` intermittently fails (Prisma P2024 pool timeouts on the render-time views increment), so the focused test for WU3 is not reliably green. Full-change verdict: **FAIL (partial, expected)** — PR4 admin + PR5 cleanup pending.

### Completeness (slice)

| Metric | Value |
|--------|-------|
| Slice tasks (3.1–3.8 + W1) | 9 |
| Tasks complete | 9 |
| Tasks incomplete in-slice | 0 |
| Tasks incomplete change-wide | 9 (4.1–4.3, 5.1–5.2) |

### Build & Tests Execution (PR3)

**Typecheck**: ✅ `npm run typecheck` (tsc --noEmit) exit 0.
**Build run #1**: ❌ exit 1 — 20× `PrismaClientKnownRequestError P2024` ("Timed out fetching a new connection from the connection pool … connection_limit: 1, timeout: 10") on `prisma.post.update()` during prerender of `/posts/[slug]`; 3 of 5 post pages failed ("Export encountered errors"). Log: `/tmp/opencode/pr3-build.log` (sha256 `1f2f3b44…`).
**Build run #2** (clean `.next`): ✅ exit 0 — 18/18 pages generated, zero P2024. Log: `/tmp/opencode/pr3-build-2.log` (sha256 `905e69dc…`).

```text
Route (app)                                             Size     First Load JS
┌ ƒ /                                                   193 B           101 kB
├ ○ /_not-found                                         153 B          87.4 kB
├ ● /authors/[id]                                       193 B           101 kB
│   └ /authors/542e0d0b-cddd-48cf-a189-e7324d1b9a41
├ ○ /categories                                         181 B          96.1 kB
├ ● /categories/[slug]                                  193 B           101 kB
│   ├ /categories/frontend  ├ /categories/backend  ├ /categories/devops  └ [+2 more]
├ ● /posts/[slug]                                       193 B           101 kB
│   ├ /posts/docker-compose-local-development-setup  ├ /posts/postgresql-query-optimization-10-patterns  └ [+3 more]
├ ○ /robots.txt                                         0 B                0 B
└ ○ /sitemap.xml                                        0 B                0 B
```

**Prisma migrate**: ✅ `npx prisma migrate status` — "2 migrations found … Database schema is up to date!"; `_prisma_migrations` confirms `2_capture_rls_check_trigger` applied (`finished_at` set, not rolled back) on the live Supabase DB (direct 5432).

**Build flakiness root cause**: `DATABASE_URL` is the PgBouncer pooler 6543 with `connection_limit=1`; Next prerenders the 5 post pages in parallel, and each page runs a cached read **plus** an awaited `prisma.post.update({ views: { increment: 1 } })` (`src/app/posts/[slug]/page.tsx:66-69`). Under concurrency the single-connection pool starves → 10 s timeout → P2024 → prerender fails. Run #2 got lucky on timing. Deterministic on paper, intermittent in practice.

### Capture Migration — `prisma/migrations/2_capture_rls_check_trigger/migration.sql` vs original Bolt SQL (`supabase/migrations/20260807004121_create_devblog_schema.sql`)

| Artifact | Original (Bolt) | Capture migration | Match |
|----------|-----------------|-------------------|-------|
| CHECK on posts.status | inline `CHECK (status IN ('draft','published'))` → auto-name `posts_status_check` | `ADD CONSTRAINT "posts_status_check" CHECK ("status" IN ('draft','published'))` inside idempotent DO block (skips if exists) | ✅ identical condition + name |
| `update_updated_at()` fn | `CREATE OR REPLACE FUNCTION … NEW.updated_at = now()` | Same, identical body | ✅ |
| `posts_updated_at` trigger | `BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at()` | `DROP TRIGGER IF EXISTS` + same CREATE | ✅ |
| RLS enable | `ALTER TABLE … ENABLE ROW LEVEL SECURITY` × 5 | Same × 5 | ✅ |
| Policies | anon+authenticated SELECT/INSERT/UPDATE/DELETE on authors/categories/posts/tags; SELECT/INSERT/DELETE on post_tags (no UPDATE — junction) | Identical policy names, roles, `USING (true)`/`WITH CHECK (true)`, same post_tags shape | ✅ 1:1 (91-line capture mirrors lines 126–193 of the original) |
| Applied | n/a | `migrate status` up-to-date; `finished_at` set | ✅ idempotency proven in practice (objects already existed in live DB; DO blocks skipped, DROP IF EXISTS recreated cleanly) |

**Regression found via the trigger**: the views increment fires `update_updated_at`, so `updated_at` (→ Article `dateModified`, sitemap `lastmod`) now reflects "last viewed/regenerated", not "last edited". Live evidence: post lastmods in the built sitemap are the build timestamps (2026-08-18T15:19) while the seed data was created 2026-08-16. This is a real SEO-integrity issue (see WARNING 3).

### Spec Compliance Matrix (PR3 in-slice — 23 scenarios)

| Requirement | Scenario | Evidence | Result |
|-------------|----------|----------|--------|
| BR: Server/Client Split | Public page renders as Server Component | `'use client'` present ONLY in `src/app/error.tsx` (required); pages are async RSC; prerendered HTML fully formed | ✅ COMPLIANT |
| BR: Server/Client Split | Interactive element isolates to Client Component | `Navbar.tsx`, `mode-toggle.tsx`, `theme-provider.tsx` are dedicated `'use client'` files; layout stays RSC (upgraded from PR1 PARTIAL) | ✅ COMPLIANT |
| BR: SSG+ISR | Home page pre-renders with ISR revalidation | Build shows `ƒ /` — page reads `searchParams` → **dynamic**, not Static (Σ/○). Data layer ISR via `unstable_cache` revalidate 300 + tag 'posts' (`src/app/page.tsx:19`). Spec demands Static output; design (design.md line 24) explicitly chose "dynamic on searchParams" → spec–design conflict, scenario not literally met | ⚠️ PARTIAL |
| BR: SSG+ISR | Post detail pre-renders for all slugs | `generateStaticParams` returns 5 slugs (`src/app/posts/[slug]/page.tsx:27-34`); build `● SSG` per slug; revalidate 300 | ✅ COMPLIANT |
| BR: SSG+ISR | Category and author pages pre-render | `● SSG`: 5 category slugs + 1 author id (build output); spec text says `/category/[slug]`, design+impl use `/categories/[slug]` (spec-internal inconsistency) | ✅ COMPLIANT |
| BR: Loading/Error/NotFound | Loading state during data fetch | `loading.tsx` at root, posts, posts/[slug], categories (authors covered by root) | ✅ COMPLIANT |
| BR: Loading/Error/NotFound | Error boundary with recovery | `src/app/error.tsx` client, `reset()` "Try again" button | ✅ COMPLIANT |
| BR: Loading/Error/NotFound | Not-found for invalid slugs | `notFound()` + `posts/[slug]/not-found.tsx`; root `not-found.tsx` | ✅ COMPLIANT |
| PV: Server-Side View Increment | View increments on page visit | `await prisma.post.update({ views: { increment: 1 } })` during render, server-side, no client JS | ✅ COMPLIANT |
| PV: Server-Side View Increment | Increment does not break static output | **Build run #1 failed exactly here** (P2024, 20×, 3/5 post pages) — static output CAN break | ❌ FAILING |
| PV: View Count Display | Count shown on post detail | `{post.views.toLocaleString()} views` (`page.tsx:127`); reflects render-time DB value | ✅ COMPLIANT |
| PV: No Client-Side View Tracking | No client tracking scripts | Zero `fetch` in src/app\|lib\|components; no view endpoint; increment server-only | ✅ COMPLIANT |
| SEO: generateMetadata | Post detail metadata | title/description/og (type=article, publishedTime, modifiedTime)/twitter present — **og:image absent** (posts have no cover_image in seed; `lib/seo.ts:31,37` produce empty arrays) | ⚠️ PARTIAL |
| SEO: generateMetadata | Author profile metadata | `buildAuthorMetadata`: title=name, description=bio, og type=profile; HTML `<title>Alex Rivera | DevBlog</title>` | ✅ COMPLIANT |
| SEO: generateMetadata | Category/tag collection metadata | `buildCategoryMetadata`: "Frontend Articles" title + description; verified in HTML | ✅ COMPLIANT |
| SEO: JSON-LD | Article schema on post detail | Valid JSON-LD block: headline/author/datePublished/dateModified/url present — **`image` key dropped** (`coverImage || undefined` → JSON.stringify strips it); spec lists image | ⚠️ PARTIAL |
| SEO: JSON-LD | Person schema on author page | Valid block `{"@type":"Person","name":"Alex Rivera","url":…}` | ✅ COMPLIANT |
| SEO: Sitemap and Robots | Sitemap includes all public routes | 13 URLs: home + 5 posts + categories index + 5 categories + 1 author, all with lastmod — **no tag URLs, no `/?tag=` URLs** (design checklist line 92 explicitly wants `/?tag=`) | ⚠️ PARTIAL |
| SEO: Sitemap and Robots | Robots.txt allows crawling | Verified body: `User-Agent: * / Allow: / / Sitemap: https://devblog.dev/sitemap.xml` | ✅ COMPLIANT |
| SEO: Canonical URLs | Canonical on post page | `rel="canonical" href="https://devblog.dev/posts/react-server-components-deep-dive"` in HTML; author/category via `alternates` | ✅ COMPLIANT |
| SEO: Image Optimization | Cover uses next/image | PostCard + post cover + author avatar all `next/image` with width/height; dicebear remotePatterns configured | ✅ COMPLIANT |
| PDA: Environment Variables | Env vars not in client bundle | No `NEXT_PUBLIC` in src/prisma/config; re-verified (was PR1 COMPLIANT) | ✅ COMPLIANT |
| PDA: Connection Pooling | Runtime queries without connection exhaustion | **Observed 20× P2024 pool exhaustion at build** (`connection_limit=1` + concurrent prerender writes) | ❌ FAILING |

**Compliance summary (PR3 in-slice)**: 17/23 COMPLIANT, 4/23 PARTIAL, 2/23 FAILING.
**Cumulative (change)**: 23/42 COMPLIANT, 5 PARTIAL, 2 FAILING, 12 deferred (blog-admin 10 + BR admin 2, PR4); **10/23 requirements fully satisfied** (BR Server/Client Split, BR Loading/Error, PV View Count Display, PV No-Client Tracking, SEO Canonical, SEO Image, PDA Singleton, PDA Baseline, PDA Env Vars, PDA Seed).

### Correctness (Static Evidence, PR3)

| Item | Status | Notes |
|------|--------|-------|
| `src/lib/markdown.ts` | ✅ Implemented | unified → remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-highlight → rehype-stringify (D4 exact) |
| `src/lib/seo.ts` | ✅ Implemented | post/author/category metadata builders + Article/Person JSON-LD; canonical via `alternates` |
| `src/lib/utils.ts` | ✅ Implemented | cn, slugify, estimateReadingTime, formatDate, toISOString ported |
| `src/app/page.tsx` | ✅ Implemented | unstable_cache ×3 (posts/categories/tags), tag 'posts', revalidate 300; q/category/tag searchParams filtering; **renders `ƒ` dynamic** |
| `src/app/posts/[slug]/page.tsx` | ✅ Implemented | generateStaticParams(5), generateMetadata Article, Article JSON-LD, views increment, notFound(); **awaited write blocks render** (P2024 trigger) |
| `src/app/categories/**` + `authors/[id]` | ✅ Implemented | SSG + generateStaticParams + CollectionPage/ProfilePage metadata + Person JSON-LD |
| `src/app/sitemap.ts` | ✅ Implemented | 13 URLs all with lastmod; **no tags/`/?tag=`**; queries Prisma directly (no unstable_cache — D6 deviation) |
| `src/app/robots.ts` | ✅ Implemented | allow all + sitemap reference |
| `src/app/layout.tsx` | ✅ Implemented | metadataBase https://devblog.dev, title template, WebSite JSON-LD, ThemeProvider+Navbar client islands |
| loading/error/not-found set | ✅ Implemented | root + posts + posts/[slug] + categories; smoke page **deleted** (`7223e87`, -58 lines); zero `/smoke` references in src/prisma |
| `src/components/*` | ✅ Implemented | PostCard (next/image), Navbar/mode-toggle/theme-provider `'use client'`, ui badge/button/card/skeleton server-safe |
| Capture migration | ✅ Implemented | RLS/CHECK/trigger 1:1 vs original Bolt SQL, idempotent, applied live |
| `prisma/migrations` naming | ✅ Implemented | `0_init` → `2_capture_rls_check_trigger` sort correctly |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| D3 fire-and-forget views increment | ⚠️ Deviation | Implemented as **awaited** `prisma.post.update` — blocks render; a fire-and-forget `void` write would not fail prerender on pool timeout |
| D4 markdown server pipeline | ✅ Yes | Exact chain |
| D6 single tag 'posts' + revalidate 300 | ⚠️ Partial | All page data queries wrapped; **sitemap.ts bypasses unstable_cache** |
| D3/D6 no per-view invalidation loop | ✅ Yes | No revalidateTag on increment; admin-only tag invalidation intact |
| D7 literal `app/admin/` | ➖ Out of slice (PR4) | Navbar `/admin` link 404s until PR4 (pre-existing, known) |
| Folder/component map | ✅ Yes | matches design except admin (PR4) |
| `import "server-only"` in db.ts | ⚠️ Deviation | Still missing (carried over from PR1) |
| Sitemap incl. `/?tag=` URLs (design testing table) | ❌ Missing | See WARNING 4 |

### Issues Found (PR3)

**CRITICAL**:
1. **`npm run build` is intermittently failing — P2024 pool exhaustion on the views increment during prerender.** `src/app/posts/[slug]/page.tsx:66-69` awaits a `prisma.post.update()` while `DATABASE_URL` (PgBouncer 6543) runs `connection_limit=1`; 5 parallel prerenders starve the single-connection pool → 10 s timeout → prerender error → exit 1 (observed: run #1 failed with 20× P2024, 3/5 post pages; run #2 passed 18/18). The focused test for WU3 (`npm run build`, tasks.md) is not reliably green; apply-progress's "exit 0, all routes generated" reflects a lucky run, not stability. Recommendation (apply-side): make the increment fire-and-forget (`void prisma.post.update(…)`) per D3's letter so a write timeout cannot fail the render, and/or re-check `connection_limit` for the write path.

**WARNING**:
1. **Home page renders `ƒ Dynamic`, not Static** — spec BR "Home page pre-renders with ISR revalidation" requires Σ/○ output; reading `searchParams` makes Next 14 render `/` per-request (build evidence). Data layer still ISR (unstable_cache, revalidate 300, tag 'posts') — design explicitly accepted this (design.md line 24: "dynamic on q/category/tag searchParams"). Spec–design conflict: scenario PARTIAL.
2. **Views increment rewrites `updated_at` via the capture-migration trigger** — the `update_updated_at` trigger fires on every `views` UPDATE, so Article `dateModified` and sitemap `lastmod` drift to "last viewed/regenerated" (live evidence: sitemap lastmods = 2026-08-18T15:19 build timestamps vs seed dates 2026-08-16). SEO integrity issue; fix belongs on the write path (e.g., exclude the write from the trigger or bump `updated_at` only on content changes).
3. **Sitemap omits tag URLs and `/?tag=` filter URLs** — SEO spec scenario "includes … all tag URLs" and design testing checklist (design.md line 92) not met; `src/app/sitemap.ts` only emits home/posts/categories/authors (13 URLs).
4. **Article JSON-LD and og:image lack `image`** — seed posts have no `cover_image` and `lib/seo.ts:58` (`coverImage || undefined`) drops the key; spec scenarios require image in Article JSON-LD and og tags.
5. **apply-progress overclaims** — "18 static pages" is imprecise (home is `ƒ`), and "build → exit 0" did not survive a second run; same paper-trail class as PR1/PR2 warnings.
6. **sitemap.ts queries Prisma without unstable_cache** — design D6 says every public Prisma query is cached; sitemap hits the DB on each ISR regeneration (minor, but a D6 deviation).

**SUGGESTION**:
1. Add a `tags` route or `/?tag=` entries to the sitemap once tag pages land; or document why tag URLs are intentionally absent.
2. Emit CollectionPage JSON-LD on category pages (design mentions CollectionPage; only Article/Person/WebSite exist today; og:type is "website").
3. Align spec text to design: BR/SEO specs write `/category/[slug]`, implementation+design use `/categories/[slug]`.
4. `import "server-only"` in `src/lib/db.ts` (carried-over PR1 deviation).
5. Navbar `/admin` link 404s until PR4 — revisit when admin lands (pre-existing).
6. `@updatedAt` on `Post.updatedAt` remains absent (PR2 suggestion) — with the trigger, updated_at is maintained DB-side, so acceptable; reconsider if the trigger is later removed.

### Verdict

**FAIL — scoped to slice PR3.** All 9 slice tasks are implemented and 17/23 in-slice scenarios are COMPLIANT (routes, JSON-LD validity, canonical, robots, capture migration all verified against specs at runtime), but the focused test `npm run build` is not reliably green: the awaited render-time views increment exhausts the `connection_limit=1` pooler during parallel prerender (observed P2024, exit 1). The slice is not merge-ready until that write path is made non-blocking or the pool config is adjusted. **Full change: FAIL (partial, expected)** — 10/23 requirements and tasks 4.1–5.2 (PR4 admin, PR5 cleanup) remain; chain is not archive-ready.
