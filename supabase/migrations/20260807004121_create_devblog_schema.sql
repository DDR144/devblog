/*
# DevBlog Schema

## Summary
Creates the complete schema for a technical blog platform where developers can publish articles.

## New Tables

### authors
- `id` (uuid, PK) - unique identifier
- `name` (text) - display name
- `email` (text, unique) - contact email
- `bio` (text) - short biography
- `avatar_url` (text) - profile image URL
- `github` (text) - GitHub username
- `twitter` (text) - Twitter/X handle
- `created_at` (timestamptz) - creation timestamp

### categories
- `id` (uuid, PK) - unique identifier
- `name` (text, unique) - display name
- `slug` (text, unique) - URL-safe identifier
- `description` (text) - short description
- `color` (text) - hex color for badge styling
- `created_at` (timestamptz) - creation timestamp

### posts
- `id` (uuid, PK) - unique identifier
- `title` (text) - article title
- `slug` (text, unique) - URL-safe identifier
- `excerpt` (text) - short description
- `content` (text) - full Markdown content
- `cover_image` (text) - hero image URL
- `author_id` (uuid, FK -> authors.id) - post author
- `category_id` (uuid, FK -> categories.id) - primary category
- `status` (text) - 'draft' | 'published'
- `reading_time` (int) - estimated minutes
- `views` (int) - view counter
- `published_at` (timestamptz) - publication date
- `created_at` (timestamptz) - creation timestamp
- `updated_at` (timestamptz) - last edit timestamp

### tags
- `id` (uuid, PK) - unique identifier
- `name` (text, unique) - display name
- `slug` (text, unique) - URL-safe identifier
- `created_at` (timestamptz) - creation timestamp

### post_tags (junction)
- `post_id` (uuid, FK -> posts.id) - post reference
- `tag_id` (uuid, FK -> tags.id) - tag reference

## Security
- RLS enabled on all tables
- Single-tenant (no auth): anon + authenticated can do full CRUD

## Indexes
- posts.slug, posts.status, posts.published_at, posts.author_id, posts.category_id
- categories.slug, tags.slug, authors.email
*/

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  github text DEFAULT '',
  twitter text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  cover_image text DEFAULT '',
  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  reading_time int DEFAULT 1,
  views int DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Post-tags junction
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts(category_id);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Authors policies
DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_authors" ON authors;
CREATE POLICY "anon_insert_authors" ON authors FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_authors" ON authors;
CREATE POLICY "anon_update_authors" ON authors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_authors" ON authors;
CREATE POLICY "anon_delete_authors" ON authors FOR DELETE TO anon, authenticated USING (true);

-- Categories policies
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- Posts policies
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
CREATE POLICY "anon_select_posts" ON posts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
CREATE POLICY "anon_insert_posts" ON posts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_posts" ON posts;
CREATE POLICY "anon_update_posts" ON posts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_posts" ON posts;
CREATE POLICY "anon_delete_posts" ON posts FOR DELETE TO anon, authenticated USING (true);

-- Tags policies
DROP POLICY IF EXISTS "anon_select_tags" ON tags;
CREATE POLICY "anon_select_tags" ON tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tags" ON tags;
CREATE POLICY "anon_insert_tags" ON tags FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tags" ON tags;
CREATE POLICY "anon_update_tags" ON tags FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tags" ON tags;
CREATE POLICY "anon_delete_tags" ON tags FOR DELETE TO anon, authenticated USING (true);

-- Post-tags policies
DROP POLICY IF EXISTS "anon_select_post_tags" ON post_tags;
CREATE POLICY "anon_select_post_tags" ON post_tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_post_tags" ON post_tags;
CREATE POLICY "anon_insert_post_tags" ON post_tags FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_post_tags" ON post_tags;
CREATE POLICY "anon_delete_post_tags" ON post_tags FOR DELETE TO anon, authenticated USING (true);

-- Seed data
INSERT INTO authors (name, email, bio, avatar_url, github, twitter)
VALUES (
  'Alex Rivera',
  'alex@devblog.dev',
  'Senior Software Engineer passionate about distributed systems, TypeScript, and developer tooling. Writing about real problems and hard-won solutions.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  'alexrivera',
  'alexrivera_dev'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name, slug, description, color) VALUES
  ('Frontend', 'frontend', 'UI, frameworks, and browser APIs', '#3b82f6'),
  ('Backend', 'backend', 'APIs, databases, and server architecture', '#8b5cf6'),
  ('DevOps', 'devops', 'CI/CD, containers, and infrastructure', '#10b981'),
  ('TypeScript', 'typescript', 'Type safety, patterns, and advanced types', '#f59e0b'),
  ('Architecture', 'architecture', 'System design and software patterns', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('React', 'react'),
  ('TypeScript', 'typescript'),
  ('Node.js', 'nodejs'),
  ('PostgreSQL', 'postgresql'),
  ('Docker', 'docker'),
  ('Performance', 'performance'),
  ('Testing', 'testing'),
  ('CSS', 'css'),
  ('API Design', 'api-design'),
  ('Security', 'security')
ON CONFLICT (slug) DO NOTHING;

-- Seed posts using subqueries to get IDs
DO $$
DECLARE
  author_id uuid;
  cat_frontend uuid;
  cat_backend uuid;
  cat_devops uuid;
  cat_typescript uuid;
  tag_react uuid;
  tag_typescript uuid;
  tag_nodejs uuid;
  tag_postgresql uuid;
  tag_docker uuid;
  tag_performance uuid;
  tag_api_design uuid;
  post1 uuid;
  post2 uuid;
  post3 uuid;
  post4 uuid;
  post5 uuid;
BEGIN
  SELECT id INTO author_id FROM authors WHERE email = 'alex@devblog.dev';
  SELECT id INTO cat_frontend FROM categories WHERE slug = 'frontend';
  SELECT id INTO cat_backend FROM categories WHERE slug = 'backend';
  SELECT id INTO cat_devops FROM categories WHERE slug = 'devops';
  SELECT id INTO cat_typescript FROM categories WHERE slug = 'typescript';
  SELECT id INTO tag_react FROM tags WHERE slug = 'react';
  SELECT id INTO tag_typescript FROM tags WHERE slug = 'typescript';
  SELECT id INTO tag_nodejs FROM tags WHERE slug = 'nodejs';
  SELECT id INTO tag_postgresql FROM tags WHERE slug = 'postgresql';
  SELECT id INTO tag_docker FROM tags WHERE slug = 'docker';
  SELECT id INTO tag_performance FROM tags WHERE slug = 'performance';
  SELECT id INTO tag_api_design FROM tags WHERE slug = 'api-design';

  INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, reading_time, views, published_at)
  VALUES (
    'Building Type-Safe APIs with tRPC and TypeScript',
    'building-type-safe-apis-trpc-typescript',
    'Discover how tRPC eliminates the gap between your backend and frontend types, enabling end-to-end type safety without code generation.',
    E'# Building Type-Safe APIs with tRPC and TypeScript\n\nIf you''ve ever spent an afternoon chasing down a bug caused by a mismatched API response shape, you know the pain. Today we''re going to look at how **tRPC** solves this problem elegantly.\n\n## What is tRPC?\n\ntRPC allows you to build and consume fully type-safe APIs without schemas or code generation. It leverages TypeScript''s type inference to give you autocompletion and type-checking across your entire stack.\n\n```typescript\n// server/router.ts\nimport { initTRPC } from "@trpc/server";\n\nconst t = initTRPC.create();\n\nexport const router = t.router({\n  getUser: t.procedure\n    .input(z.object({ id: z.string() }))\n    .query(async ({ input }) => {\n      return db.user.findUnique({ where: { id: input.id } });\n    }),\n});\n```\n\n## Why tRPC over REST?\n\n1. **Zero schema drift** — your types are the source of truth\n2. **Instant refactoring** — rename a field and TypeScript tells you everywhere it breaks\n3. **No code generation** — types flow naturally without build steps\n\n## Setting Up Your First Router\n\nStart by installing the required packages:\n\n```bash\nnpm install @trpc/server @trpc/client @trpc/react-query zod\n```\n\n## Conclusion\n\ntRPC is a game-changer for full-stack TypeScript projects. The DX improvements alone make it worth adopting on your next project.',
    author_id, cat_typescript, 'published', 6, 1247, now() - interval '3 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post1;

  IF post1 IS NULL THEN
    SELECT id INTO post1 FROM posts WHERE slug = 'building-type-safe-apis-trpc-typescript';
  END IF;

  INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, reading_time, views, published_at)
  VALUES (
    'React Server Components: A Deep Dive',
    'react-server-components-deep-dive',
    'RSC changes how we think about data fetching and component composition. This post breaks down the mental model you need to use them effectively.',
    E'# React Server Components: A Deep Dive\n\nReact Server Components (RSC) represent the biggest shift in how we write React applications since hooks. Let''s break down what they actually are.\n\n## The Mental Model\n\nForget everything you know about client-side React for a moment. Server Components run **only on the server** — they have access to your database, file system, and secrets. They never ship JavaScript to the browser.\n\n```tsx\nasync function BlogPost({ slug }: { slug: string }) {\n  const post = await db.posts.findUnique({ where: { slug } });\n  \n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <Markdown>{post.content}</Markdown>\n    </article>\n  );\n}\n```\n\n## Client vs Server Components\n\n| Feature | Server | Client |\n|---------|--------|--------|\n| useState | No | Yes |\n| useEffect | No | Yes |\n| DB access | Yes | No |\n| Async/await | Yes | Limited |\n\n## When to Use Each\n\nDefault to Server Components. Reach for `"use client"` only when you need event handlers, browser APIs, useState, or useEffect.\n\n## Conclusion\n\nRSC is not just a performance optimization — it''s a new paradigm. Embrace the server-first model.',
    author_id, cat_frontend, 'published', 8, 892, now() - interval '7 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post2;

  IF post2 IS NULL THEN
    SELECT id INTO post2 FROM posts WHERE slug = 'react-server-components-deep-dive';
  END IF;

  INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, reading_time, views, published_at)
  VALUES (
    'PostgreSQL Query Optimization: 10 Patterns That Changed My Life',
    'postgresql-query-optimization-10-patterns',
    'From slow full-table scans to millisecond responses — the PostgreSQL techniques every backend developer should master.',
    E'# PostgreSQL Query Optimization: 10 Patterns That Changed My Life\n\nI''ve been using PostgreSQL for over a decade and these are the patterns that consistently turn 10-second queries into sub-10ms ones.\n\n## 1. EXPLAIN ANALYZE Is Your Best Friend\n\n```sql\nEXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\nSELECT * FROM posts\nWHERE author_id = $1\nAND status = ''published''\nORDER BY published_at DESC\nLIMIT 10;\n```\n\nLook for `Seq Scan` — that''s your optimization target.\n\n## 2. Composite Indexes Follow Column Order\n\n```sql\nCREATE INDEX posts_author_date ON posts(author_id, published_at DESC);\n```\n\n## 3. Partial Indexes Are Underused\n\n```sql\nCREATE INDEX posts_published ON posts(published_at DESC)\nWHERE status = ''published'';\n```\n\n## 4. Use CTEs for Readability, Not Performance\n\nIn PostgreSQL 12+, CTEs are no longer optimization fences. Write them for clarity.\n\n## Conclusion\n\nMost query performance issues come from missing or mismatched indexes. Profile first, then optimize.',
    author_id, cat_backend, 'published', 10, 2341, now() - interval '14 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post3;

  IF post3 IS NULL THEN
    SELECT id INTO post3 FROM posts WHERE slug = 'postgresql-query-optimization-10-patterns';
  END IF;

  INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, reading_time, views, published_at)
  VALUES (
    'Docker Compose for Local Development: The Setup I Use on Every Project',
    'docker-compose-local-development-setup',
    'A production-grade local development environment with Docker Compose that every team should be using.',
    E'# Docker Compose for Local Development\n\nEvery developer has a different local environment. Docker Compose fixes this by making your dev environment reproducible, version-controlled, and shareable.\n\n## The Base Setup\n\n```yaml\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    volumes:\n      - .:/app\n    environment:\n      - DATABASE_URL=postgresql://user:pass@db:5432/myapp\n    depends_on:\n      db:\n        condition: service_healthy\n\n  db:\n    image: postgres:16-alpine\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready"]\n      interval: 5s\n```\n\n## Hot Reloading With Volumes\n\nThe volume mount enables live code reloading without rebuilding the container.\n\n## Conclusion\n\nInvest 30 minutes setting up Docker Compose on your next project. It pays dividends for the entire team.',
    author_id, cat_devops, 'published', 7, 567, now() - interval '21 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post4;

  IF post4 IS NULL THEN
    SELECT id INTO post4 FROM posts WHERE slug = 'docker-compose-local-development-setup';
  END IF;

  INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, reading_time, views, published_at)
  VALUES (
    'The Art of API Design: REST Principles That Actually Matter',
    'api-design-rest-principles',
    'Not every REST convention is worth following. Here are the ones that genuinely improve developer experience and long-term maintainability.',
    E'# The Art of API Design\n\nI''ve consumed thousands of APIs and built hundreds. Here''s what separates the frustrating ones from the delightful ones.\n\n## Resource Naming\n\nAlways plural nouns. Never verbs.\n\n```\nGET /posts\nGET /posts/:id\nPOST /posts\nPATCH /posts/:id\nDELETE /posts/:id\n```\n\n## Consistent Error Responses\n\n```json\n{\n  "error": {\n    "code": "RESOURCE_NOT_FOUND",\n    "message": "Post with id not found"\n  }\n}\n```\n\n## Versioning Strategy\n\nUse URL versioning for breaking changes: `/v1/posts`. Header-based versioning is elegant in theory but painful in practice.\n\n## Pagination\n\nCursor-based pagination scales better than offset-based:\n\n```json\n{\n  "data": [],\n  "pagination": { "cursor": "...", "hasMore": true }\n}\n```\n\n## Conclusion\n\nGood API design is about empathy for the developer consuming your API.',
    author_id, cat_backend, 'published', 9, 1893, now() - interval '28 days'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post5;

  IF post5 IS NULL THEN
    SELECT id INTO post5 FROM posts WHERE slug = 'api-design-rest-principles';
  END IF;

  -- Post tags
  INSERT INTO post_tags (post_id, tag_id) VALUES
    (post1, tag_typescript), (post1, tag_nodejs),
    (post2, tag_react), (post2, tag_typescript),
    (post3, tag_postgresql), (post3, tag_performance),
    (post4, tag_docker), (post4, tag_nodejs),
    (post5, tag_api_design), (post5, tag_nodejs)
  ON CONFLICT DO NOTHING;
END $$;
