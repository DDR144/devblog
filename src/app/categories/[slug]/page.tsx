import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { buildCategoryMetadata } from "@/lib/seo";
import { toISOString } from "@/lib/utils";
import { PostCard } from "@/components/PostCard";

const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
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
  ["category-by-slug"],
  { tags: ["posts"], revalidate: 300 }
);

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  });
  return categories.map((c) => ({ slug: c.slug }));
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  return buildCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h1 className="text-3xl font-bold">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>

      {category.posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No articles in this category yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.posts.map((post) => (
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
  );
}
