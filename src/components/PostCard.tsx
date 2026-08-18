import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  readingTime: number;
  authorName: string;
  categoryName: string;
  categorySlug: string;
}

export function PostCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  readingTime,
  authorName,
  categoryName,
  categorySlug,
}: PostCardProps) {
  return (
    <article className="group rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition-shadow">
      {coverImage && (
        <Link href={`/posts/${slug}`} className="block overflow-hidden rounded-t-xl">
          <Image
            src={coverImage}
            alt={title}
            width={600}
            height={340}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/categories/${categorySlug}`} className="hover:text-foreground transition-colors">
            <Badge variant="secondary">{categoryName}</Badge>
          </Link>
          <span>·</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          <span>·</span>
          <span>{readingTime} min read</span>
        </div>
        <Link href={`/posts/${slug}`} className="block">
          <h2 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
            {title}
          </h2>
        </Link>
        <p className="text-muted-foreground text-sm line-clamp-2">{excerpt}</p>
        <div className="text-xs text-muted-foreground">By {authorName}</div>
      </div>
    </article>
  );
}
