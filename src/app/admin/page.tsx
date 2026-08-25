import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { postTags: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/admin/new">
          <Button>New Post</Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No posts yet.</p>
          <Link href="/admin/new" className="text-foreground underline mt-2 inline-block">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="font-medium hover:underline truncate"
                  >
                    {post.title}
                  </Link>
                  <Badge
                    variant={post.status === "published" ? "default" : "secondary"}
                  >
                    {post.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author?.name ?? "Unknown"}</span>
                  {post.category && (
                    <>
                      <span>·</span>
                      <span>{post.category.name}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{post._count.postTags} tags</span>
                  <span>·</span>
                  <span>{post.readingTime} min read</span>
                  <span>·</span>
                  <span>{post.views.toLocaleString()} views</span>
                  <span>·</span>
                  <time dateTime={post.updatedAt.toISOString()}>
                    {formatDate(post.updatedAt)}
                  </time>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Link href={`/admin/edit/${post.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                {post.status === "published" && (
                  <Link href={`/posts/${post.slug}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
