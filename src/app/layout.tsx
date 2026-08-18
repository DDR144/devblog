import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DevBlog — Technical Articles for Developers",
    template: "%s | DevBlog",
  },
  description:
    "Technical articles about software engineering, distributed systems, TypeScript, and developer tooling.",
  metadataBase: new URL("https://devblog.dev"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DevBlog",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevBlog",
  description:
    "Technical articles about software engineering, distributed systems, TypeScript, and developer tooling.",
  url: "https://devblog.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
              <div className="container mx-auto px-4">
                &copy; {new Date().getFullYear()} DevBlog. Built with Next.js.
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
