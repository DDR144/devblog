import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin | DevBlog",
  description: "Manage your blog posts and content",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to blog
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
