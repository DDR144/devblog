import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, Calendar, GitBranch, AtSign, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { supabase, type PostWithRelations } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    supabase
      .from('posts')
      .select(`*, authors(*), categories(*), post_tags(tags(*))`)
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setPost(data as PostWithRelations)
          // Increment views
          supabase
            .from('posts')
            .update({ views: (data as PostWithRelations).views + 1 })
            .eq('id', (data as PostWithRelations).id)
            .then(() => {})
        }
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-4 h-4 w-20" />
        <Skeleton className="mb-3 h-10 w-3/4" />
        <Skeleton className="mb-6 h-4 w-1/2" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Button asChild><Link to="/">Back to blog</Link></Button>
      </div>
    )
  }

  const tags = post.post_tags?.map((pt) => pt.tags).filter(Boolean) ?? []

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 -ml-2">
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {/* Header */}
      <header className="mb-8">
        {post.categories && (
          <Link to={`/categories/${post.categories.slug}`}>
            <Badge
              variant="secondary"
              className="mb-3"
              style={{ backgroundColor: `${post.categories.color}20`, color: post.categories.color, borderColor: `${post.categories.color}40` }}
            >
              {post.categories.name}
            </Badge>
          </Link>
        )}
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-y py-4">
          {post.authors && (
            <Link to={`/author/${post.authors.id}`} className="flex items-center gap-2 group">
              <Avatar size="sm">
                <AvatarImage src={post.authors.avatar_url} alt={post.authors.name} />
                <AvatarFallback>{post.authors.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium group-hover:text-primary transition-colors">{post.authors.name}</div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {post.reading_time} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              {post.views.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <MarkdownRenderer content={post.content} />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
          {tags.map((tag) => (
            <Link key={tag.id} to={`/?tag=${tag.slug}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Author card */}
      {post.authors && (
        <div className="mt-10 rounded-xl border bg-muted/30 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar size="lg">
              <AvatarImage src={post.authors.avatar_url} alt={post.authors.name} />
              <AvatarFallback className="text-lg">{post.authors.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Written by {post.authors.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{post.authors.bio}</p>
              <div className="mt-3 flex items-center gap-3">
                {post.authors.github && (
                  <a href={`https://github.com/${post.authors.github}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <GitBranch className="size-4" />
                  </a>
                )}
                {post.authors.twitter && (
                  <a href={`https://twitter.com/${post.authors.twitter}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <AtSign className="size-4" />
                  </a>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link to={`/author/${post.authors.id}`}>View profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit link */}
      <div className="mt-8 text-center">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/admin/edit/${post.id}`}>
            <Edit className="size-3.5" />
            Edit this post
          </Link>
        </Button>
      </div>
    </article>
  )
}
