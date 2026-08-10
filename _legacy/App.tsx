import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { BlogHome } from '@/pages/BlogHome'
import { PostDetail } from '@/pages/PostDetail'
import { AuthorProfile } from '@/pages/AuthorProfile'
import { CategoryDetail, CategoriesList } from '@/pages/CategoryPages'
import { AdminList } from '@/pages/AdminList'
import { AdminEditor } from '@/pages/AdminEditor'

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<BlogHome />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/admin" element={<AdminList />} />
            <Route path="/admin/new" element={<AdminEditor />} />
            <Route path="/admin/edit/:id" element={<AdminEditor />} />
          </Routes>
        </main>
        <footer className="border-t py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6">
            DevBlog — A technical blog platform for engineering teams
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
