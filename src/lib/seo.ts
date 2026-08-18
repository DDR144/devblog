import type { Metadata } from "next";

const SITE_URL = "https://devblog.dev";
const SITE_NAME = "DevBlog";

interface PostMeta {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  authorId: string;
}

export function buildPostMetadata(post: PostMeta): Metadata {
  const url = `${SITE_URL}/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function buildArticleJsonLd(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.authorName,
      url: `${SITE_URL}/authors/${post.authorId}`,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.coverImage || undefined,
    url: `${SITE_URL}/posts/${post.slug}`,
  };
}

interface AuthorMeta {
  name: string;
  id: string;
  bio: string;
  avatarUrl: string;
}

export function buildAuthorMetadata(author: AuthorMeta): Metadata {
  const url = `${SITE_URL}/authors/${author.id}`;
  return {
    title: author.name,
    description: author.bio,
    openGraph: {
      title: author.name,
      description: author.bio,
      url,
      siteName: SITE_NAME,
      type: "profile",
      images: author.avatarUrl ? [{ url: author.avatarUrl, alt: author.name }] : [],
    },
    twitter: {
      card: "summary",
      title: author.name,
      description: author.bio,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function buildPersonJsonLd(author: AuthorMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}/authors/${author.id}`,
  };
}

interface CategoryMeta {
  name: string;
  slug: string;
  description: string;
}

export function buildCategoryMetadata(category: CategoryMeta): Metadata {
  const url = `${SITE_URL}/categories/${category.slug}`;
  return {
    title: `${category.name} Articles`,
    description: category.description || `Articles tagged with ${category.name}`,
    openGraph: {
      title: `${category.name} Articles`,
      description: category.description || `Articles tagged with ${category.name}`,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: {
      canonical: url,
    },
  };
}
