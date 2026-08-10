import { Link, useLocation } from 'react-router-dom'
import { Code2, Menu, X, Rss } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Blog' },
  { href: '/categories', label: 'Categories' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="size-4" />
            </div>
            <span className="text-lg tracking-tight">DevBlog</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link to="/admin">
                <Rss className="size-3.5" />
                Admin
              </Link>
            </Button>
            <button
              className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                    pathname === link.href ? 'bg-accent text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Admin Panel
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
