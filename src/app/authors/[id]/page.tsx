import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { buildAuthorMetadata, buildPersonJsonLd } from "@/lib/seo";
import { toISOString } from "@/lib/utils";
import { PostCard } from "@/components/PostCard";

const getAuthorById = unstable_cache(
  async (id: string) => {
    return prisma.author.findUnique({
      where: { id },
      include: {
        posts: {
          where: { status: "published" },
          include: {
            author: true,
            category: true,
            postTags: { include: { tag: true } },
          },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
  },
  ["author-by-id"],
  { tags: ["posts"], revalidate: 300 }
);

export async function generateStaticParams() {
  const authors = await prisma.author.findMany({
    select: { id: true },
  });
  return authors.map((a) => ({ id: a.id }));
}

interface AuthorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params;
  const author = await getAuthorById(id);
  if (!author) return { title: "Author Not Found" };

  return buildAuthorMetadata({
    name: author.name,
    id: author.id,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author) {
    notFound();
  }

  const jsonLd = buildPersonJsonLd({
    name: author.name,
    id: author.id,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-8">
        {/* Author header */}
        <div className="flex items-start gap-6">
          {author.avatarUrl && (
            <Image
              src={author.avatarUrl}
              alt={author.name}
              width={96}
              height={96}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{author.name}</h1>
            {author.bio && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{author.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {author.github && (
                <a
                  href={`https://github.com/${author.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub: {author.github}
                </a>
              )}
              {author.twitter && (
                <a
                  href={`https://twitter.com/${author.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Twitter: {author.twitter}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Articles by {author.name}</h2>
          {author.posts.length === 0 ? (
            <p className="text-muted-foreground">No articles yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {author.posts.map((post) => (
                <PostCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  publishedAt={toISOString(post.publishedAt ?? post.createdAt)}
                  readingTime={post.readingTime}
                  authorName={post.author?.name ?? "Unknown"}
                  categoryName={post.category?.name ?? "Uncategorized"}
                  categorySlug={post.category?.slug ?? "uncategorized"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
