import { Link } from 'react-router-dom'
import { Clock, Eye, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { type PostWithRelations } from '@/lib/supabase'
import { formatDateShort } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: PostWithRelations
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const tags = post.post_tags?.map((pt) => pt.tags).filter(Boolean) ?? []

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        featured && 'md:flex-row'
      )}
    >
      {/* Cover image placeholder */}
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background text-primary/20 shrink-0',
          featured ? 'h-48 md:h-auto md:w-80' : 'h-44'
        )}
      >
        <div className="font-mono text-6xl font-black opacity-30 select-none">
          {post.title.charAt(0)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Category */}
        {post.categories && (
          <div>
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color, borderColor: `${post.categories.color}40` }}
            >
              {post.categories.name}
            </Badge>
          </div>
        )}

        {/* Title */}
        <Link to={`/post/${post.slug}`} className="group/link">
          <h2
            className={cn(
              'font-bold leading-tight text-foreground transition-colors group-hover/link:text-primary',
              featured ? 'text-xl' : 'text-lg'
            )}
          >
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {post.excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} to={`/?tag=${tag.slug}`}>
                <Badge variant="outline" className="text-xs hover:bg-accent transition-colors cursor-pointer">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.authors && (
              <>
                <Avatar size="sm">
                  <AvatarImage src={post.authors.avatar_url} alt={post.authors.name} />
                  <AvatarFallback>{post.authors.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Link
                  to={`/author/${post.authors.id}`}
                  className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                >
                  {post.authors.name}
                </Link>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDateShort(post.published_at ?? post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.reading_time}m
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3" />
              {post.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
