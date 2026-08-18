import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const SITE_URL = "https://devblog.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, authors] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { slug: true, createdAt: true },
    }),
    prisma.author.findMany({
      select: { id: true, createdAt: true },
    }),
  ]);

  const homeEntry: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    ...categories.map((cat) => ({
      url: `${SITE_URL}/categories/${cat.slug}`,
      lastModified: cat.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${SITE_URL}/authors/${author.id}`,
    lastModified: author.createdAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...homeEntry, ...postEntries, ...categoryEntries, ...authorEntries];
}
