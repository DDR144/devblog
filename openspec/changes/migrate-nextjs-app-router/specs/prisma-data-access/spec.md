# Prisma Data Access Specification

## Purpose

Defines Prisma schema design, client singleton, connection strategy, migration workflow, and seed data preservation over the existing Supabase Postgres.

## Requirements

### Requirement: Prisma Schema Reflects Existing Tables

The system MUST define a Prisma schema that maps to the 5 existing Supabase tables: `authors`, `categories`, `posts`, `tags`, `post_tags`.

#### Scenario: Schema introspects existing database

- GIVEN the existing Supabase database has 5 tables
- WHEN `prisma db pull` executes against the Supabase direct connection (port 5432)
- THEN the generated schema reflects all tables, columns, and relationships
- AND no destructive modifications are applied to the database

#### Scenario: Schema defines relations

- GIVEN the schema is generated
- WHEN inspected
- THEN `Post` has a relation to `Author` (author_id), `Category` (category_id), and a many-to-many through `post_tags` to `Tag`

### Requirement: Client Singleton

The system MUST export a Prisma client singleton (`lib/db.ts`) that prevents multiple client instances in development hot-reload.

#### Scenario: Singleton prevents multiple instances

- GIVEN the application runs in development mode with hot-reload
- WHEN multiple modules import the Prisma client
- THEN only one PrismaClient instance is active
- AND the singleton pattern is applied via `globalThis` caching

### Requirement: Connection Pooling Strategy

The system MUST use port 5432 (direct connection) for migrations and port 6543 (PgBouncer transaction pooler) for runtime queries.

#### Scenario: Migrations use direct connection

- GIVEN `prisma migrate dev` or `prisma migrate deploy` executes
- THEN the connection uses the `DATABASE_URL` pointing to port 5432
- AND migrations complete successfully against the Supabase database

#### Scenario: Runtime queries use pooled connection

- GIVEN the Next.js application handles a request
- WHEN Prisma queries execute
- Then the connection uses `DIRECT_URL` (port 5432) for migrations and `DATABASE_URL` (port 6543) for runtime
- AND queries complete without connection exhaustion

### Requirement: Baseline Migration Preserves Seed Data

The system MUST create a baseline Prisma migration that captures the current schema state without modifying data.

#### Scenario: Baseline migration created

- GIVEN the database has existing seed data (1 author, 5 categories, 10 tags, 5 posts)
- WHEN `prisma migrate diff` and baseline migration execute
- THEN the migration records schema history only
- AND no INSERT, UPDATE, or DELETE statements modify existing data

#### Scenario: Seed data intact after migration

- GIVEN the baseline migration has been applied
- WHEN the database is queried
- THEN all seed records are present: 1 author, 5 categories, 10 tags, 5 posts
- AND no data has been recreated or duplicated

### Requirement: Environment Variables

The system MUST use server-only environment variables for database credentials. `DATABASE_URL` and `DIRECT_URL` MUST NOT be exposed to the client.

#### Scenario: Env vars not in client bundle

- GIVEN `NEXT_PUBLIC_` prefixed vars are used for public config
- WHEN `DATABASE_URL` and `DIRECT_URL` are defined
- THEN they are NOT prefixed with `NEXT_PUBLIC_`
- AND they do not appear in the client-side JavaScript bundle

### Requirement: Seed Script

The system MUST have a Prisma seed script that is NOT re-run during normal migration workflows.

#### Scenario: Seed script exists and is idempotent

- GIVEN the seed script (`prisma/seed.ts` or equivalent) exists
- WHEN `prisma db seed` is executed manually
- THEN it seeds data only if records do not already exist (idempotent)
- AND it does NOT run automatically as part of `prisma migrate`
