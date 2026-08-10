import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { supabase, type Author, type Category, type Tag } from '@/lib/supabase'
import { slugify, estimateReadingTime } from '@/lib/utils'
import { toast } from 'sonner'

export function AdminEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('authors').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('tags').select('*').order('name'),
    ]).then(([aRes, cRes, tRes]) => {
      setAuthors((aRes.data as Author[]) ?? [])
      setCategories((cRes.data as Category[]) ?? [])
      setTags((tRes.data as Tag[]) ?? [])
    })
  }, [])

  useEffect(() => {
    if (!id) return
    supabase
      .from('posts')
      .select(`*, post_tags(tags(*))`)
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setSlug(data.slug)
          setExcerpt(data.excerpt ?? '')
          setContent(data.content ?? '')
          setAuthorId(data.author_id ?? '')
          setCategoryId(data.category_id ?? '')
          setStatus(data.status)
          setSelectedTags(data.post_tags?.map((pt: { tags: Tag }) => pt.tags.id) ?? [])
        }
        setLoading(false)
      })
  }, [id])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isEdit || !slug) setSlug(slugify(val))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!slug.trim()) {
      toast.error('Slug is required')
      return
    }
    if (!content.trim()) {
      toast.error('Content is required')
      return
    }

    setSaving(true)
    const readingTime = estimateReadingTime(content)
    const payload = {
      title,
      slug,
      excerpt,
      content,
      author_id: authorId || null,
      category_id: categoryId || null,
      status,
      reading_time: readingTime,
      published_at: status === 'published' ? (isEdit ? undefined : new Date().toISOString()) : null,
    }

    try {
      let postId = id
      if (isEdit) {
        const { error } = await supabase.from('posts').update(payload).eq('id', id!)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('posts').insert(payload).select('id').single()
        if (error) throw error
        postId = data.id
      }

      // Sync tags
      if (postId) {
        await supabase.from('post_tags').delete().eq('post_id', postId)
        if (selectedTags.length > 0) {
          const tagRows = selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId }))
          await supabase.from('post_tags').insert(tagRows)
        }
      }

      toast.success(isEdit ? 'Post updated' : 'Post created')
      navigate('/admin')
    } catch (err) {
      toast.error('Failed to save post')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to="/admin"><ArrowLeft className="size-4" /> Back</Link>
          </Button>
          <h1 className="text-xl font-bold">
            {isEdit ? 'Edit post' : 'New post'}
          </h1>
          <Badge variant={status === 'published' ? 'default' : 'secondary'} className={status === 'published' ? 'bg-emerald-600 text-white' : ''}>
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="size-4" />
            {showPreview ? 'Editor' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="size-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div className="rounded-xl border bg-card p-8 min-h-[400px]">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <FileText className="size-8 opacity-40" />
              <p>Nothing to preview yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Your article title..."
              className="text-lg"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/post/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="url-friendly-slug"
                className="flex-1"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description shown on cards and search results..."
              rows={2}
            />
          </div>

          {/* Author + Category + Status */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                <SelectContent>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'published')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 rounded-lg border p-3">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag.id)
                return (
                  <button key={tag.id} onClick={() => {
                    setSelectedTags(active
                      ? selectedTags.filter((t) => t !== tag.id)
                      : [...selectedTags, tag.id])
                  }}>
                    <Badge
                      variant={active ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                    >
                      {tag.name}
                    </Badge>
                  </button>
                )
              })}
              {tags.length === 0 && (
                <span className="text-sm text-muted-foreground">No tags available</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article in Markdown..."
              rows={18}
              className="font-mono text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Supports GitHub Flavored Markdown: headings, code blocks, tables, lists, and more.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
