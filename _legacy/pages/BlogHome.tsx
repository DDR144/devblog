import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, X, TrendingUp, BookOpen, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/PostCard'
import { supabase, type PostWithRelations, type Category, type Tag as TagType } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function BlogHome() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<PostWithRelations[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  const activeCategory = searchParams.get('category')
  const activeTag = searchParams.get('tag')
  const activeQuery = searchParams.get('q') ?? ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          authors(*),
          categories(*),
          post_tags(tags(*))
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory)
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (activeQuery) {
        query = query.ilike('title', `%${activeQuery}%`)
      }

      const { data, error } = await query
      if (error) throw error

      let filtered = (data as PostWithRelations[]) ?? []

      if (activeTag) {
        filtered = filtered.filter((p) =>
          p.post_tags?.some((pt) => pt.tags?.slug === activeTag)
        )
      }

      setPosts(filtered)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, activeTag, activeQuery, categories])

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
    supabase.from('tags').select('*').order('name').then(({ data }) => {
      if (data) setTags(data)
    })
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (search) next.set('q', search)
    else next.delete('q')
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearch('')
    setSearchParams({})
  }

  const hasFilters = activeCategory || activeTag || activeQuery

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <BookOpen className="size-3.5" />
          Engineering Blog
        </div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
          Ideas Worth Building
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Deep dives into architecture, TypeScript, databases, and the hard problems we solve every day.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 space-y-6">
          {/* Search */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</h3>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); clearFilters() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </form>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.delete('category')
                  setSearchParams(next)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent text-left',
                  !activeCategory ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                All posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('category', cat.slug)
                    setSearchParams(next)
                  }}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent text-left',
                    activeCategory === cat.slug ? 'bg-accent font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="size-3" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    if (activeTag === tag.slug) next.delete('tag')
                    else next.set('tag', tag.slug)
                    setSearchParams(next)
                  }}
                >
                  <Badge
                    variant={activeTag === tag.slug ? 'default' : 'outline'}
                    className="cursor-pointer text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {tag.name}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </aside>

        {/* Posts */}
        <div className="flex-1 min-w-0">
          {/* Active filter pill */}
          {hasFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{activeQuery}"
                  <button onClick={() => { setSearch(''); const n = new URLSearchParams(searchParams); n.delete('q'); setSearchParams(n) }}>
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {activeCategory && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.slug === activeCategory)?.name ?? activeCategory}
                  <button onClick={() => { const n = new URLSearchParams(searchParams); n.delete('category'); setSearchParams(n) }}>
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
              {activeTag && (
                <Badge variant="secondary" className="gap-1">
                  #{tags.find(t => t.slug === activeTag)?.name ?? activeTag}
                  <button onClick={() => { const n = new URLSearchParams(searchParams); n.delete('tag'); setSearchParams(n) }}>
                    <X className="size-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border overflow-hidden">
                  <Skeleton className="h-44 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
              <TrendingUp className="size-8 text-muted-foreground/40" />
              <p className="text-muted-foreground">No posts match your filters.</p>
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : (
            <>
              {/* Featured first post */}
              {posts[0] && !hasFilters && (
                <div className="mb-6">
                  <PostCard post={posts[0]} featured />
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                {(hasFilters ? posts : posts.slice(1)).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                {posts.length} article{posts.length !== 1 ? 's' : ''} total
              </p>
            </>
          )}
        </div>
      </div>

      {/* Category links at bottom */}
      {!hasFilters && categories.length > 0 && (
        <section className="mt-16 rounded-xl border bg-muted/30 p-8">
          <h2 className="mb-2 text-xl font-bold">Browse by Category</h2>
          <p className="mb-6 text-sm text-muted-foreground">Explore articles organized by topic</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="group flex items-start gap-3 rounded-lg border bg-background p-4 transition-all hover:shadow-sm hover:-translate-y-0.5"
              >
                <span
                  className="mt-0.5 size-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
