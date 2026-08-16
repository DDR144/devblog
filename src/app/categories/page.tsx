import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { posts: { where: { status: "published" } } } },
      },
    });
  },
  ["categories-all"],
  { tags: ["posts"], revalidate: 300 }
);

export const metadata = {
  title: "Categories",
  description: "Browse articles by category.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Categories</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="block p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <h2 className="font-semibold">{cat.name}</h2>
            </div>
            {cat.description && (
              <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
            )}
            <Badge variant="secondary">
              {cat._count.posts} {cat._count.posts === 1 ? "article" : "articles"}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
