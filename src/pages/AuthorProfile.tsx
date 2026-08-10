import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, GitBranch, AtSign, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/PostCard'
import { supabase, type Author, type PostWithRelations } from '@/lib/supabase'

export function AuthorProfile() {
  const { id } = useParams<{ id: string }>()
  const [author, setAuthor] = useState<Author | null>(null)
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      supabase.from('authors').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('posts')
        .select(`*, authors(*), categories(*), post_tags(tags(*))`)
        .eq('author_id', id)
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ]).then(([authorRes, postsRes]) => {
      setAuthor(authorRes.data as Author | null)
      setPosts((postsRes.data as PostWithRelations[]) ?? [])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-24 w-full rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold mb-2">Author not found</h1>
        <Button asChild><Link to="/">Back to blog</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/"><ArrowLeft className="size-4" /> Back to blog</Link>
      </Button>

      {/* Author header */}
      <div className="mb-10 rounded-xl border bg-card p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="size-20">
            <AvatarImage src={author.avatar_url} alt={author.name} />
            <AvatarFallback className="text-2xl">{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{author.name}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">{author.bio}</p>
            <div className="mt-4 flex items-center gap-4">
              {author.github && (
                <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <GitBranch className="size-4" /> @{author.github}
                </a>
              )}
              {author.twitter && (
                <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <AtSign className="size-4" /> @{author.twitter}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 px-6 py-4">
            <span className="text-2xl font-bold">{posts.length}</span>
            <span className="text-xs text-muted-foreground">Articles</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <FileText className="size-4" />
        Articles by {author.name}
      </h2>
      {posts.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No published articles yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
