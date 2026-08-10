import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, FileText, Eye, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { supabase, type PostWithRelations } from '@/lib/supabase'
import { formatDateShort } from '@/lib/utils'
import { toast } from 'sonner'

export function AdminList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select(`*, authors(*), categories(*), post_tags(tags(*))`)
      .order('created_at', { ascending: false })
    setPosts((data as PostWithRelations[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete post')
    } else {
      toast.success('Post deleted')
      fetchPosts()
    }
  }

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const draftCount = posts.filter((p) => p.status === 'draft').length
  const publishedCount = posts.filter((p) => p.status === 'published').length

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">Manage your blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/"><ArrowLeft className="size-4" /> View blog</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/new"><Plus className="size-4" /> New post</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold">{posts.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-emerald-600">{publishedCount}</div>
          <div className="text-xs text-muted-foreground">Published</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold text-amber-600">{draftCount}</div>
          <div className="text-xs text-muted-foreground">Drafts</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <p className="text-muted-foreground">
            {search ? 'No posts match your search.' : 'No posts yet. Create your first one!'}
          </p>
          {!search && (
            <Button asChild size="sm">
              <Link to="/admin/new"><Plus className="size-4" /> New post</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to={`/admin/edit/${post.id}`} className="font-medium hover:text-primary transition-colors truncate">
                    {post.title}
                  </Link>
                  <Badge
                    variant={post.status === 'published' ? 'default' : 'secondary'}
                    className={post.status === 'published' ? 'bg-emerald-600 text-white' : ''}
                  >
                    {post.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {post.categories && <span>{post.categories.name}</span>}
                  <span>{formatDateShort(post.published_at ?? post.created_at)}</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" />{post.views}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {post.status === 'published' && (
                  <Button asChild variant="ghost" size="icon" className="size-8">
                    <Link to={`/post/${post.slug}`} target="_blank">
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate(`/admin/edit/${post.id}`)}>
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{post.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(post.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
