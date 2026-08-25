"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify, estimateReadingTime } from "@/lib/utils";

export interface PostFormData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "draft" | "published";
  authorId: string | null;
  categoryId: string | null;
  tagIds: string[];
  publishedAt?: string | null;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  postId?: string;
}

export async function createPost(data: PostFormData): Promise<ActionResult> {
  try {
    const slug = data.slug || slugify(data.title);
    const readingTime = estimateReadingTime(data.content);

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        status: data.status,
        readingTime,
        authorId: data.authorId || null,
        categoryId: data.categoryId || null,
        publishedAt: data.status === "published" ? new Date() : null,
        postTags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
      },
    });

    revalidateTag("posts");
    revalidatePath("/admin");
    revalidatePath("/");
    redirect(`/admin/edit/${post.id}`);
  } catch (error) {
    console.error("Failed to create post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create post",
    };
  }
}

export async function updatePost(data: PostFormData): Promise<ActionResult> {
  if (!data.id) {
    return { success: false, error: "Post ID is required" };
  }

  try {
    const slug = data.slug || slugify(data.title);
    const readingTime = estimateReadingTime(data.content);

    // Get current post to check status change
    const currentPost = await prisma.post.findUnique({
      where: { id: data.id },
      select: { status: true },
    });

    const publishedAt =
      data.status === "published" && currentPost?.status !== "published"
        ? new Date()
        : undefined;

    await prisma.$transaction([
      // Update post
      prisma.post.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage,
          status: data.status,
          readingTime,
          authorId: data.authorId || null,
          categoryId: data.categoryId || null,
          ...(publishedAt && { publishedAt }),
        },
      }),
      // Sync tags: delete existing, create new
      prisma.postTag.deleteMany({ where: { postId: data.id } }),
      prisma.postTag.createMany({
        data: data.tagIds.map((tagId) => ({ postId: data.id!, tagId })),
      }),
    ]);

    revalidateTag("posts");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/posts/${slug}`);
    return { success: true, postId: data.id };
  } catch (error) {
    console.error("Failed to update post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update post",
    };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    await prisma.post.delete({ where: { id } });

    revalidateTag("posts");
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/posts/${post.slug}`);
    redirect("/admin");
  } catch (error) {
    console.error("Failed to delete post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete post",
    };
  }
}
