"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, slugify } from "@/lib/utils";
import { createPost, updatePost, deletePost } from "@/lib/actions";
import type { ActionResult } from "@/lib/actions";

interface Author {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PostEditorProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    status: string;
    authorId: string | null;
    categoryId: string | null;
    tagIds: string[];
  };
  authors: Author[];
  categories: Category[];
  tags: Tag[];
}

export function PostEditor({
  post,
  authors,
  categories,
  tags,
}: PostEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    post?.status === "published" ? "published" : "draft"
  );
  const [authorId, setAuthorId] = useState<string>(post?.authorId ?? "");
  const [categoryId, setCategoryId] = useState<string>(post?.categoryId ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    post?.tagIds ?? []
  );

  const isEditing = !!post;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing || !slug) {
      setSlug(slugify(value));
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = {
      id: post?.id,
      title,
      slug,
      excerpt,
      content,
      coverImage,
      status,
      authorId: authorId || null,
      categoryId: categoryId || null,
      tagIds: selectedTagIds,
    };

    startTransition(async () => {
      const result: ActionResult = isEditing
        ? await updatePost(formData)
        : await createPost(formData);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  async function handleDelete() {
    if (!post?.id) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    startTransition(async () => {
      const result = await deletePost(post.id);
      if (!result.success) {
        setError(result.error ?? "Failed to delete post");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="My awesome post"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono text-sm"
              placeholder="my-awesome-post"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label htmlFor="excerpt" className="text-sm font-medium">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Brief description of your post..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium">
                Content (Markdown)
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                {preview ? "Edit" : "Preview"}
              </Button>
            </div>
            {preview ? (
              <div className="min-h-[400px] p-4 border border-border rounded-md bg-muted/50 prose-devblog overflow-auto">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nothing to preview yet...
                  </p>
                )}
              </div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                required
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono text-sm resize-y min-h-[400px]"
                placeholder="Write your post content in Markdown..."
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus("draft")}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={status === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus("published")}
              >
                Published
              </Button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-medium">
              Cover Image URL
            </label>
            <input
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm"
              placeholder="https://..."
            />
            {coverImage && (
              <div className="mt-2 aspect-video rounded-md overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <label htmlFor="author" className="text-sm font-medium">
              Author
            </label>
            <select
              id="author"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            >
              <option value="">No author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-sm"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTagIds.includes(tag.id) ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTagIds.includes(tag.id)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground">No tags available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Post"
                  : "Create Post"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                className="w-full"
                onClick={handleDelete}
              >
                Delete Post
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
