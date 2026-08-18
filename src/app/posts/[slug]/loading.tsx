import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}
