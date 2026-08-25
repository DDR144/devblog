import { prisma } from "@/lib/db";
import { PostEditor } from "@/components/PostEditor";

export default async function NewPostPage() {
  const [authors, categories, tags] = await Promise.all([
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Post</h1>
      <PostEditor
        authors={authors}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
