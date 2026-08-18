import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { buildPostMetadata, buildArticleJsonLd } from "@/lib/seo";
import { formatDate, toISOString } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const getPostBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.post.findUnique({
      where: { slug, status: "published" },
      include: {
        author: true,
        category: true,
        postTags: { include: { tag: true } },
      },
    });
  },
  ["post-by-slug"],
  { tags: ["posts"], revalidate: 300 }
);

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { slug: true },
    take: 5,
  });
  return posts.map((p) => ({ slug: p.slug }));
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  return buildPostMetadata({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: toISOString(post.publishedAt ?? post.createdAt),
    updatedAt: toISOString(post.updatedAt),
    authorName: post.author?.name ?? "Unknown",
    authorId: post.author?.id ?? "",
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Render-time views increment (D3: fire-and-forget, no cache invalidation).
  // Must NOT be awaited: blocking the render exhausts the pgbouncer pool
  // (connection_limit=1) during parallel prerender of the 5 seeded posts (P2024).
  // The promise MUST stay referenced: Prisma Client drops unawaited/unreferenced
  // promises (void kills the query silently); .catch keeps the commit alive with
  // error swallowing so a DB hiccup can never fail the render.
  prisma.post
    .update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {});

  const htmlContent = await renderMarkdown(post.content);
  const jsonLd = buildArticleJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: toISOString(post.publishedAt ?? post.createdAt),
    updatedAt: toISOString(post.updatedAt),
    authorName: post.author?.name ?? "Unknown",
    authorId: post.author?.id ?? "",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to all articles
        </Link>

        {/* Header */}
        <header className="space-y-4">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}>
              <Badge variant="secondary">{post.category.name}</Badge>
            </Link>
          )}
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <Link href={`/authors/${post.author.id}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                {post.author.avatarUrl && (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span>{post.author.name}</span>
              </Link>
            )}
            <span>·</span>
            <time dateTime={toISOString(post.publishedAt)}>
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <span>{post.views.toLocaleString()} views</span>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={400}
            className="w-full rounded-xl object-cover"
            priority
          />
        )}

        {/* Content */}
        <div
          className="prose-devblog"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Tags */}
        {post.postTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            {post.postTags.map((pt) => (
              <Badge key={pt.tag.id} variant="outline">
                {pt.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
