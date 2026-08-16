import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Author ──────────────────────────────────────────────
  const author = await prisma.author.upsert({
    where: { email: "alex@devblog.dev" },
    update: {},
    create: {
      name: "Alex Rivera",
      email: "alex@devblog.dev",
      bio: "Senior Software Engineer passionate about distributed systems, TypeScript, and developer tooling. Writing about real problems and hard-won solutions.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      github: "alexrivera",
      twitter: "alexrivera_dev",
    },
  });
  console.log(`  ✓ Author: ${author.name} (${author.id})`);

  // ── Categories ──────────────────────────────────────────
  const categoriesData = [
    { name: "Frontend", slug: "frontend", description: "UI, frameworks, and browser APIs", color: "#3b82f6" },
    { name: "Backend", slug: "backend", description: "APIs, databases, and server architecture", color: "#8b5cf6" },
    { name: "DevOps", slug: "devops", description: "CI/CD, containers, and infrastructure", color: "#10b981" },
    { name: "TypeScript", slug: "typescript", description: "Type safety, patterns, and advanced types", color: "#f59e0b" },
    { name: "Architecture", slug: "architecture", description: "System design and software patterns", color: "#ef4444" },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.slug] = result;
    console.log(`  ✓ Category: ${result.name}`);
  }

  // ── Tags ────────────────────────────────────────────────
  const tagsData = [
    { name: "React", slug: "react" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Node.js", slug: "nodejs" },
    { name: "PostgreSQL", slug: "postgresql" },
    { name: "Docker", slug: "docker" },
    { name: "Performance", slug: "performance" },
    { name: "Testing", slug: "testing" },
    { name: "CSS", slug: "css" },
    { name: "API Design", slug: "api-design" },
    { name: "Security", slug: "security" },
  ];

  const tags: Record<string, { id: string }> = {};
  for (const tag of tagsData) {
    const result = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
    tags[tag.slug] = result;
    console.log(`  ✓ Tag: ${result.name}`);
  }

  // ── Posts ───────────────────────────────────────────────
  const now = new Date();

  const postsData = [
    {
      title: "Building Type-Safe APIs with tRPC and TypeScript",
      slug: "building-type-safe-apis-trpc-typescript",
      excerpt: "Discover how tRPC eliminates the gap between your backend and frontend types, enabling end-to-end type safety without code generation.",
      content: `# Building Type-Safe APIs with tRPC and TypeScript

If you've ever spent an afternoon chasing down a bug caused by a mismatched API response shape, you know the pain. Today we're going to look at how **tRPC** solves this problem elegantly.

## What is tRPC?

tRPC allows you to build and consume fully type-safe APIs without schemas or code generation. It leverages TypeScript's type inference to give you autocompletion and type-checking across your entire stack.

\`\`\`typescript
// server/router.ts
import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const router = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.user.findUnique({ where: { id: input.id } });
    }),
});
\`\`\`

## Why tRPC over REST?

1. **Zero schema drift** — your types are the source of truth
2. **Instant refactoring** — rename a field and TypeScript tells you everywhere it breaks
3. **No code generation** — types flow naturally without build steps

## Setting Up Your First Router

Start by installing the required packages:

\`\`\`bash
npm install @trpc/server @trpc/client @trpc/react-query zod
\`\`\`

## Conclusion

tRPC is a game-changer for full-stack TypeScript projects. The DX improvements alone make it worth adopting on your next project.`,
      authorId: author.id,
      categoryId: categories["typescript"].id,
      status: "published",
      readingTime: 6,
      views: 1247,
      publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      tags: ["typescript", "nodejs"],
    },
    {
      title: "React Server Components: A Deep Dive",
      slug: "react-server-components-deep-dive",
      excerpt: "RSC changes how we think about data fetching and component composition. This post breaks down the mental model you need to use them effectively.",
      content: `# React Server Components: A Deep Dive

React Server Components (RSC) represent the biggest shift in how we write React applications since hooks. Let's break down what they actually are.

## The Mental Model

Forget everything you know about client-side React for a moment. Server Components run **only on the server** — they have access to your database, file system, and secrets. They never ship JavaScript to the browser.

\`\`\`tsx
async function BlogPost({ slug }: { slug: string }) {
  const post = await db.posts.findUnique({ where: { slug } });
  
  return (
    <article>
      <h1>{post.title}</h1>
      <Markdown>{post.content}</Markdown>
    </article>
  );
}
\`\`\`

## Client vs Server Components

| Feature | Server | Client |
|---------|--------|--------|
| useState | No | Yes |
| useEffect | No | Yes |
| DB access | Yes | No |
| Async/await | Yes | Limited |

## When to Use Each

Default to Server Components. Reach for \`"use client"\` only when you need event handlers, browser APIs, useState, or useEffect.

## Conclusion

RSC is not just a performance optimization — it's a new paradigm. Embrace the server-first model.`,
      authorId: author.id,
      categoryId: categories["frontend"].id,
      status: "published",
      readingTime: 8,
      views: 892,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      tags: ["react", "typescript"],
    },
    {
      title: "PostgreSQL Query Optimization: 10 Patterns That Changed My Life",
      slug: "postgresql-query-optimization-10-patterns",
      excerpt: "From slow full-table scans to millisecond responses — the PostgreSQL techniques every backend developer should master.",
      content: `# PostgreSQL Query Optimization: 10 Patterns That Changed My Life

I've been using PostgreSQL for over a decade and these are the patterns that consistently turn 10-second queries into sub-10ms ones.

## 1. EXPLAIN ANALYZE Is Your Best Friend

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM posts
WHERE author_id = $1
AND status = 'published'
ORDER BY published_at DESC
LIMIT 10;
\`\`\`

Look for \`Seq Scan\` — that's your optimization target.

## 2. Composite Indexes Follow Column Order

\`\`\`sql
CREATE INDEX posts_author_date ON posts(author_id, published_at DESC);
\`\`\`

## 3. Partial Indexes Are Underused

\`\`\`sql
CREATE INDEX posts_published ON posts(published_at DESC)
WHERE status = 'published';
\`\`\`

## 4. Use CTEs for Readability, Not Performance

In PostgreSQL 12+, CTEs are no longer optimization fences. Write them for clarity.

## Conclusion

Most query performance issues come from missing or mismatched indexes. Profile first, then optimize.`,
      authorId: author.id,
      categoryId: categories["backend"].id,
      status: "published",
      readingTime: 10,
      views: 2341,
      publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      tags: ["postgresql", "performance"],
    },
    {
      title: "Docker Compose for Local Development: The Setup I Use on Every Project",
      slug: "docker-compose-local-development-setup",
      excerpt: "A production-grade local development environment with Docker Compose that every team should be using.",
      content: `# Docker Compose for Local Development

Every developer has a different local environment. Docker Compose fixes this by making your dev environment reproducible, version-controlled, and shareable.

## The Base Setup

\`\`\`yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 5s
\`\`\`

## Hot Reloading With Volumes

The volume mount enables live code reloading without rebuilding the container.

## Conclusion

Invest 30 minutes setting up Docker Compose on your next project. It pays dividends for the entire team.`,
      authorId: author.id,
      categoryId: categories["devops"].id,
      status: "published",
      readingTime: 7,
      views: 567,
      publishedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      tags: ["docker", "nodejs"],
    },
    {
      title: "The Art of API Design: REST Principles That Actually Matter",
      slug: "api-design-rest-principles",
      excerpt: "Not every REST convention is worth following. Here are the ones that genuinely improve developer experience and long-term maintainability.",
      content: `# The Art of API Design

I've consumed thousands of APIs and built hundreds. Here's what separates the frustrating ones from the delightful ones.

## Resource Naming

Always plural nouns. Never verbs.

\`\`\`
GET /posts
GET /posts/:id
POST /posts
PATCH /posts/:id
DELETE /posts/:id
\`\`\`

## Consistent Error Responses

\`\`\`json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Post with id not found"
  }
}
\`\`\`

## Versioning Strategy

Use URL versioning for breaking changes: \`/v1/posts\`. Header-based versioning is elegant in theory but painful in practice.

## Pagination

Cursor-based pagination scales better than offset-based:

\`\`\`json
{
  "data": [],
  "pagination": { "cursor": "...", "hasMore": true }
}
\`\`\`

## Conclusion

Good API design is about empathy for the developer consuming your API.`,
      authorId: author.id,
      categoryId: categories["backend"].id,
      status: "published",
      readingTime: 9,
      views: 1893,
      publishedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      tags: ["api-design", "nodejs"],
    },
  ];

  for (const postData of postsData) {
    const { tags: tagSlugs, ...postFields } = postData;
    const post = await prisma.post.upsert({
      where: { slug: postFields.slug },
      update: {},
      create: postFields,
    });

    // Sync post_tags
    for (const tagSlug of tagSlugs) {
      await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tags[tagSlug].id } },
        update: {},
        create: { postId: post.id, tagId: tags[tagSlug].id },
      });
    }

    console.log(`  ✓ Post: ${post.title}`);
  }

  // ── Verify counts ──────────────────────────────────────
  const counts = await Promise.all([
    prisma.author.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.post.count(),
    prisma.postTag.count(),
  ]);
  console.log(`\nSeed complete: ${counts[0]} author, ${counts[1]} categories, ${counts[2]} tags, ${counts[3]} posts, ${counts[4]} post_tags`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
