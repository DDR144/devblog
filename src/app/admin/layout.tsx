"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xl font-bold">
            DevBlog Admin
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                Posts
              </Button>
            </Link>
            <Link href="/admin/new">
              <Button size="sm">New Post</Button>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to blog
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
