import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
      <h1 className="text-4xl font-bold">Post Not Found</h1>
      <p className="text-muted-foreground">
        The article you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
}
