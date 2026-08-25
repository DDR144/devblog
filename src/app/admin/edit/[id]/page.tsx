import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PostEditor } from "@/components/PostEditor";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const [post, authors, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { postTags: { select: { tagId: true } } },
    }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Post</h1>
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: post.status,
          authorId: post.authorId,
          categoryId: post.categoryId,
          tagIds: post.postTags.map((pt) => pt.tagId),
        }}
        authors={authors}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
