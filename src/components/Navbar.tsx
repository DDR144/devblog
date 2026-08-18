"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          DevBlog
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Categories
          </Link>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Admin
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
