import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { PostCard } from "@/components/PostCard";
import { toISOString } from "@/lib/utils";

const getPublishedPosts = unstable_cache(
  async () => {
    return prisma.post.findMany({
      where: { status: "published" },
      include: {
        author: true,
        category: true,
        postTags: { include: { tag: true } },
      },
      orderBy: { publishedAt: "desc" },
    });
  },
  ["posts-published"],
  { tags: ["posts"], revalidate: 300 }
);

const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },
  ["categories-all"],
  { tags: ["posts"], revalidate: 300 }
);

const getTags = unstable_cache(
  async () => {
    return prisma.tag.findMany({ orderBy: { name: "asc" } });
  },
  ["tags-all"],
  { tags: ["posts"], revalidate: 300 }
);

interface HomePageProps {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [allPosts, categories, tags] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getTags(),
  ]);

  let filteredPosts = allPosts;

  if (params.q) {
    const query = params.q.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query)
    );
  }

  if (params.category) {
    filteredPosts = filteredPosts.filter(
      (p) => p.category?.slug === params.category
    );
  }

  if (params.tag) {
    filteredPosts = filteredPosts.filter((p) =>
      p.postTags.some((pt) => pt.tag.slug === params.tag)
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Latest Articles</h1>
        <p className="text-muted-foreground mt-2">
          Technical articles about software engineering and developer tooling.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 text-sm">
        <a href="/" className={`px-3 py-1 rounded-full border transition-colors ${!params.category && !params.tag ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/?category=${cat.slug}`}
            className={`px-3 py-1 rounded-full border transition-colors ${params.category === cat.slug ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {params.tag && (
        <div className="text-sm text-muted-foreground">
          Filtered by tag: <span className="font-medium text-foreground">{params.tag}</span>
          {" "}
          <a href="/" className="underline hover:text-foreground">(clear)</a>
        </div>
      )}

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No articles found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
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
