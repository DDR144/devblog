import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/PostCard'
import { supabase, type Category, type PostWithRelations } from '@/lib/supabase'

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setCategory(data as Category | null)
      if (data) {
        supabase
          .from('posts')
          .select(`*, authors(*), categories(*), post_tags(tags(*))`)
          .eq('category_id', (data as Category).id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .then(({ data: postData }) => {
            setPosts((postData as PostWithRelations[]) ?? [])
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-6 h-16 w-full rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <Button asChild><Link to="/">Back to blog</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/"><ArrowLeft className="size-4" /> Back to blog</Link>
      </Button>

      <div className="mb-8 rounded-xl border bg-card p-8">
        <div className="flex items-center gap-3">
          <span className="size-4 rounded-full" style={{ backgroundColor: category.color }} />
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        </div>
        {category.description && (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="secondary">
            {posts.length} article{posts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="size-8 text-muted-foreground/40" />
          <p className="text-muted-foreground">No articles in this category yet.</p>
        </div>
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

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      const cats = (data as Category[]) ?? []
      setCategories(cats)
      if (cats.length > 0) {
        supabase
          .from('posts')
          .select('category_id')
          .eq('status', 'published')
          .then(({ data: postData }) => {
            const c: Record<string, number> = {}
            ;(postData ?? []).forEach((p: { category_id: string | null }) => {
              if (p.category_id) c[p.category_id] = (c[p.category_id] ?? 0) + 1
            })
            setCounts(c)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Categories</h1>
      <p className="mb-8 text-muted-foreground">Browse articles by topic</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories/${cat.slug}`}
            className="group flex flex-col gap-2 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <h3 className="font-semibold group-hover:text-primary transition-colors">{cat.name}</h3>
            </div>
            {cat.description && (
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            )}
            <Badge variant="secondary" className="w-fit mt-1">
              {counts[cat.id] ?? 0} article{(counts[cat.id] ?? 0) !== 1 ? 's' : ''}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}
