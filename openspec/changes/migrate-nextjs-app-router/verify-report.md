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

## Verification Report — PR3 (Public Routes, Markdown, SEO) — RE-VERIFICATION after CRITICAL fix

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
**Branches verified**: `feat/pr3c-seo-cleanup` (chains pr3a-foundation → pr3b-public-routes → pr3c-seo-cleanup; contains fix `bac28e0`, merged via `8bb0803`)
**Version**: N/A (delta specs, 5 files — 23 requirements / 42 scenarios authoritative)
**Mode**: Standard (no TDD — no test runner detected; manual checklist per design)
**Re-verification of**: the PR3 CRITICAL — `await prisma.post.update(...)` causing intermittent `npm run build` failures (Prisma P2024 pool exhaustion, `connection_limit=1`). Fix under test: commit `bac28e0` "make views increment fire-and-forget" (`void prisma.post.update(...)`, per design D3).
**Slice verdict**: **FAIL** — the original build-stability CRITICAL is **CLOSED** (4/4 consecutive clean builds green, byte-identical output, zero P2024), but the fix introduced a **NEW CRITICAL functional regression**: `void prisma.post.update(...)` never executes the UPDATE (Prisma Client 6.19.3 drops the unreferenced promise — proven at runtime, 7/7 trials; DB views frozen). Slice is **NOT merge-ready** until the increment keeps the promise referenced (`.catch(() => {})`, validated) or equivalent. Full-change verdict: **FAIL (partial, expected)** — PR4 admin + PR5 cleanup pending.

### Completeness (slice)

| Metric | Value |
|--------|-------|
| Slice tasks (3.1–3.8 + W1) | 9 |
| Tasks complete | 9 |
| Tasks incomplete in-slice | 0 |
| Tasks incomplete change-wide | 9 (4.1–4.3, 5.1–5.2) |

### Re-verification scope

Focused on the CRITICAL fix: build stability (criterion: 3/3 consecutive green builds) and views-increment behavior. The remaining PR3 findings from the previous verification (WARNINGs 1–6, SUGGESTIONs 1–6) were re-confirmed unchanged: no code outside `src/app/posts/[slug]/page.tsx:65-71` changed since the previous report (git diff scope = `bac28e0` only), the build route table is identical, and the typecheck output hash is identical.

### Build & Tests Execution (re-verification)

**Typecheck**: ✅ `npm run typecheck` (tsc --noEmit) exit 0 — output hash `sha256:0efc9fd8…` (byte-identical to previous report).

**Build — 4 consecutive runs** (criterion 3/3; run #4 doubles as the views-increment probe). Each run: `rm -rf .next` + `npm run build`:

| Run | Exit | P2024 count | Static pages | Log sha256 |
|-----|------|-------------|--------------|------------|
| #1 | 0 | 0 | 18/18 | `905e69dc…` |
| #2 | 0 | 0 | 18/18 | `905e69dc…` |
| #3 | 0 | 0 | 18/18 | `905e69dc…` |
| #4 | 0 | 0 | 18/18 | `905e69dc…` |

All four logs are **byte-identical** (single sha256 across runs, identical to the previous passing run) — the build is deterministic, not timing luck. Zero `P2024` / "Timed out fetching a new connection" occurrences in any run. Route table unchanged: `ƒ /`, `● /posts/[slug]` ×5, `● /categories/[slug]` ×5, `● /authors/[id]` ×1, `○ /categories`, `○ /robots.txt`, `○ /sitemap.xml`, `○ /_not-found`. Logs preserved: `/tmp/opencode/pr3c-build-{1..4}.log`.

**Code inspection**: `src/app/posts/[slug]/page.tsx:65-71` — increment is `void prisma.post.update({...})`, NOT awaited, outside the render-critical path; comment documents the P2024 rationale. Matches design D3's letter ("fire-and-forget").

**Prisma migrate**: unchanged from previous verification (`migrate status` up-to-date; capture migration applied).

### Views increment — NEW CRITICAL (functional regression)

**The `void` fire-and-forget UPDATE never executes.** Prisma Client dispatches the query through a promise continuation chain; `void` discards the promise reference and the write is dropped — silently never sent. Proven empirically against the live Supabase DB (reads via the same 6543 pooler as the app):

| # | Pattern | Result |
|---|---------|--------|
| A | `await prisma.post.update(...)` (pooler) | ✅ COMMITTED (912→913) |
| B | `void prisma.post.update(...)` (pooler), 12 s wait | ❌ NOT COMMITTED (1915) |
| B×3 | `void` on 3 posts, 15 s each | ❌ NOT COMMITTED (3/3) |
| Build #4 | `void` during prerender, all 5 slugs | ❌ NOT COMMITTED (5/5 posts) |
| C | update + `.then` observer, 15 s | ✅ COMMITTED (1268→1269) |
| D | update with kept reference (observed after 15 s) | ✅ RESOLVED + COMMITTED (913→914) |
| E1 | `void` + 20 s of pool pings (`$queryRaw SELECT 1`) | ❌ NOT COMMITTED (588) |
| E2 | `void` via DIRECT_URL 5432 (no pooler), 10 s | ❌ NOT COMMITTED (1915) |
| F | `prisma.post.update({...}).catch(() => {})`, 10 s | ✅ COMMITTED (1269→1270) |

Key differentiators: **not a pooler artifact** (E2 fails identically on the direct 5432 connection); **not an idle/timing artifact** (E1 keeps the pool busy 20 s and still drops); the differentiator is the **unreferenced promise** (`void` discards it; keeping a reference — even unobserved, Test D — dispatches and commits). Prisma version: `@prisma/client` 6.19.3.

**Consequence**: views are frozen in production — the increment never persists during prerender, ISR revalidation, or any render. The post-views spec's core scenario now fails at runtime (previously rated COMPLIANT by static inspection; now disproven by runtime evidence).

**Recommended apply-side fix (minimal, D3-compliant, validated by Test F)**:
```ts
// src/app/posts/[slug]/page.tsx — replace void with referenced, error-swallowing fire-and-forget
prisma.post.update({
  where: { id: post.id },
  data: { views: { increment: 1 } },
}).catch(() => {}); // never fails the render; promise stays referenced so the query dispatches
```
Then re-verify: views increment on build and on ISR revalidation. Alternative (design-level): move the increment out of the render path entirely (Route Handler `POST /api/views/[slug]` or a Server Action from a client island) — but that violates the post-views spec's zero-client-JS scenario and requires a spec change.

### Capture Migration — `prisma/migrations/2_capture_rls_check_trigger/migration.sql` vs original Bolt SQL (`supabase/migrations/20260807004121_create_devblog_schema.sql`)

| Artifact | Original (Bolt) | Capture migration | Match |
|----------|-----------------|-------------------|-------|
| CHECK on posts.status | inline `CHECK (status IN ('draft','published'))` → auto-name `posts_status_check` | `ADD CONSTRAINT "posts_status_check" CHECK ("status" IN ('draft','published'))` inside idempotent DO block (skips if exists) | ✅ identical condition + name |
| `update_updated_at()` fn | `CREATE OR REPLACE FUNCTION … NEW.updated_at = now()` | Same, identical body | ✅ |
| `posts_updated_at` trigger | `BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at()` | `DROP TRIGGER IF EXISTS` + same CREATE | ✅ |
| RLS enable | `ALTER TABLE … ENABLE ROW LEVEL SECURITY` × 5 | Same × 5 | ✅ |
| Policies | anon+authenticated SELECT/INSERT/UPDATE/DELETE on authors/categories/posts/tags; SELECT/INSERT/DELETE on post_tags (no UPDATE — junction) | Identical policy names, roles, `USING (true)`/`WITH CHECK (true)`, same post_tags shape | ✅ 1:1 (91-line capture mirrors lines 126–193 of the original) |
| Applied | n/a | `migrate status` up-to-date; `finished_at` set | ✅ idempotency proven in practice (objects already existed in live DB; DO blocks skipped, DROP IF EXISTS recreated cleanly) |

**Regression found via the trigger**: the views increment fires `update_updated_at`, so `updated_at` (→ Article `dateModified`, sitemap `lastmod`) reflects "last viewed/regenerated", not "last edited". Live evidence: post lastmods in the built sitemap are the build timestamps (2026-08-18T15:19) while the seed data was created 2026-08-16. SEO-integrity issue — see WARNING 2 (status changed while CRITICAL 2 is open: the trigger no longer fires from views since the update never executes; the drift is frozen, not fixed).

### Spec Compliance Matrix (PR3 in-slice — 23 scenarios)

Rows marked **CHANGED** were re-evaluated with runtime evidence; all other rows carry the previous rating, re-confirmed unchanged (no code changed outside `page.tsx:65-71`).

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
| PV: Server-Side View Increment | View increments on page visit | **CHANGED** — `void prisma.post.update(...)` (`page.tsx:68`); DB views frozen across 4 builds + 5 controlled trials (Tests A–F): the unreferenced promise is dropped by Prisma, the write never executes | ❌ FAILING (was ✅) |
| PV: Server-Side View Increment | Increment does not break static output | **CHANGED** — build stable 4/4 (first clause met) but AND clause "view count update happens asynchronously" fails: no update happens at all | ❌ FAILING |
| PV: View Count Display | Count shown on post detail | **CHANGED** — `{post.views.toLocaleString()} views` (`page.tsx:129`) renders, but the count is permanently stale (never increments) | ⚠️ PARTIAL (was ✅) |
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
| PDA: Connection Pooling | Runtime queries without connection exhaustion | **CHANGED** — build no longer exhausts the pool (4/4 runs, zero P2024); but the fire-and-forget write is dropped instead of completing: exhaustion gone, write broken | ⚠️ PARTIAL (was ❌ FAILING) |

**Compliance summary (PR3 in-slice, re-verified)**: 15/23 COMPLIANT, 6/23 PARTIAL, 2/23 FAILING.
**Cumulative (change)**: 23/42 evaluated (15 COMPLIANT, 6 PARTIAL, 2 FAILING), 12 deferred (blog-admin 10 + BR admin 2, PR4); **10/23 requirements fully satisfied** (BR Server/Client Split, BR Loading/Error, PV View Count Display, PV No-Client Tracking, SEO Canonical, SEO Image, PDA Singleton, PDA Baseline, PDA Env Vars, PDA Seed).

### Correctness (Static Evidence, PR3)

| Item | Status | Notes |
|------|--------|-------|
| `src/lib/markdown.ts` | ✅ Implemented | unified → remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-highlight → rehype-stringify (D4 exact) |
| `src/lib/seo.ts` | ✅ Implemented | post/author/category metadata builders + Article/Person JSON-LD; canonical via `alternates` |
| `src/lib/utils.ts` | ✅ Implemented | cn, slugify, estimateReadingTime, formatDate, toISOString ported |
| `src/app/page.tsx` | ✅ Implemented | unstable_cache ×3 (posts/categories/tags), tag 'posts', revalidate 300; q/category/tag searchParams filtering; **renders `ƒ` dynamic** |
| `src/app/posts/[slug]/page.tsx` | ✅ Implemented (**CHANGED** by `bac28e0`) | generateStaticParams(5), generateMetadata Article, Article JSON-LD, views increment, notFound(); increment is now `void` fire-and-forget (`page.tsx:68`) — unawaited (build no longer blocked) but **silently dropped by Prisma** (see NEW CRITICAL 2) |
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
| D3 fire-and-forget views increment | ⚠️ Deviation | Implemented as `void prisma.post.update` — unawaited in letter (build stable, P2024 gone) but broken in behavior: the unreferenced promise is dropped, the write never executes. Must keep the promise referenced: `prisma.post.update({...}).catch(() => {})` |
| D4 markdown server pipeline | ✅ Yes | Exact chain |
| D6 single tag 'posts' + revalidate 300 | ⚠️ Partial | All page data queries wrapped; **sitemap.ts bypasses unstable_cache** |
| D3/D6 no per-view invalidation loop | ✅ Yes | No revalidateTag on increment; admin-only tag invalidation intact |
| D7 literal `app/admin/` | ➖ Out of slice (PR4) | Navbar `/admin` link 404s until PR4 (pre-existing, known) |
| Folder/component map | ✅ Yes | matches design except admin (PR4) |
| `import "server-only"` in db.ts | ⚠️ Deviation | Still missing (carried over from PR1) |
| Sitemap incl. `/?tag=` URLs (design testing table) | ❌ Missing | See WARNING 3 |

### Issues Found (PR3)

**CRITICAL**:
1. ~~**`npm run build` is intermittently failing — P2024 pool exhaustion on the views increment during prerender**~~ → **CLOSED.** `bac28e0` made the increment unawaited (`void prisma.post.update(…)`); 4/4 consecutive clean builds pass with byte-identical output (sha256 `905e69dc…`) and zero P2024. Build is stable and reproducible — the original CRITICAL criterion (3/3) is met and exceeded (4/4).
2. **NEW — views increment silently never executes.** `void prisma.post.update(...)` (`src/app/posts/[slug]/page.tsx:68`) discards the Prisma promise; Prisma Client 6.19.3 drops the unreferenced query — DB views frozen across 4 builds and 7 controlled trials (Tests A–F, evidence above). The build fix traded an intermittent build failure for a silent functional loss: post-views spec "View increments on page visit" now FAILS at runtime. Validated fix: `prisma.post.update({…}).catch(() => {})` (Test F commits; keeps the promise referenced, swallows write errors so the render can never fail).

**WARNING** (unchanged from previous verification unless noted — re-confirmed: no code changed outside `page.tsx:65-71`):
1. **Home page renders `ƒ Dynamic`, not Static** — spec BR "Home page pre-renders with ISR revalidation" requires Σ/○ output; reading `searchParams` makes Next 14 render `/` per-request (build evidence). Data layer still ISR (unstable_cache, revalidate 300, tag 'posts') — design explicitly accepted this (design.md line 24). Spec–design conflict: scenario PARTIAL. (unchanged)
2. **Views increment rewrites `updated_at` via the capture-migration trigger** — **status changed**: while CRITICAL 2 is open the trigger never fires from views (the update never executes), so the lastmod/dateModified drift observed previously is frozen, not fixed. When the increment is repaired, the trigger will fire on every view write again — the apply team should exclude views-only writes (e.g., a direct `UPDATE posts SET views = views + 1` bypassing the trigger, or a dedicated counter column).
3. **Sitemap omits tag URLs and `/?tag=` filter URLs** — SEO spec scenario "includes … all tag URLs" and design testing checklist (design.md line 92) not met; `src/app/sitemap.ts` only emits home/posts/categories/authors (13 URLs). (unchanged)
4. **Article JSON-LD and og:image lack `image`** — seed posts have no `cover_image` and `lib/seo.ts:58` (`coverImage || undefined`) drops the key; spec scenarios require image in Article JSON-LD and og tags. (unchanged)
5. **apply-progress overclaims** — "18 static pages" is imprecise (home is `ƒ`); the "exit 0" claim is now accurate for build stability, but the views-increment evidence in apply-progress must be updated after CRITICAL 2 is fixed. (paper-trail class as PR1/PR2)
6. **sitemap.ts queries Prisma without unstable_cache** — design D6 says every public Prisma query is cached; sitemap hits the DB on each ISR regeneration (minor, but a D6 deviation). (unchanged)

**SUGGESTION**:
1. Add a `tags` route or `/?tag=` entries to the sitemap once tag pages land; or document why tag URLs are intentionally absent.
2. Emit CollectionPage JSON-LD on category pages (design mentions CollectionPage; only Article/Person/WebSite exist today; og:type is "website").
3. Align spec text to design: BR/SEO specs write `/category/[slug]`, implementation+design use `/categories/[slug]`.
4. `import "server-only"` in `src/lib/db.ts` (carried-over PR1 deviation).
5. Navbar `/admin` link 404s until PR4 — revisit when admin lands (pre-existing).
6. `@updatedAt` on `Post.updatedAt` remains absent (PR2 suggestion) — with the trigger, updated_at is maintained DB-side, so acceptable; reconsider if the trigger is later removed.

### Verdict

**FAIL — scoped to slice PR3 (re-verification).** The original build-stability CRITICAL is **CLOSED**: 4/4 consecutive clean builds pass with byte-identical deterministic output and zero P2024 — the fix criterion (3/3) is met. However, the re-verification surfaced a **NEW CRITICAL**: the `void` fire-and-forget fix silently disables the views increment (Prisma drops the unreferenced promise; proven at runtime 7/7 trials — views frozen in the live DB, build #4 prerender included). The slice is **NOT merge-ready at CRITICAL level**: the increment must be re-implemented with a referenced promise (`prisma.post.update({…}).catch(() => {})`, validated by Test F) and re-verified (build green + views increment on ISR revalidation). All other PR3 findings stand unchanged. **Full change: FAIL (partial, expected)** — 10/23 requirements and tasks 4.1–5.2 (PR4 admin, PR5 cleanup) remain; chain is not archive-ready.
