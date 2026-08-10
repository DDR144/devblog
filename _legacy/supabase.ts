import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Author = {
  id: string
  name: string
  email: string
  bio: string
  avatar_url: string
  github: string
  twitter: string
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string
  color: string
  created_at: string
}

export type Tag = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  author_id: string | null
  category_id: string | null
  status: 'draft' | 'published'
  reading_time: number
  views: number
  published_at: string | null
  created_at: string
  updated_at: string
  authors?: Author
  categories?: Category
  post_tags?: { tags: Tag }[]
}

export type PostWithRelations = Post & {
  authors: Author | null
  categories: Category | null
  post_tags: { tags: Tag }[]
}
