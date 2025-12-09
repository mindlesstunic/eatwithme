/**
 * Homepage Loading State
 *
 * Shows skeleton UI while the discovery page loads.
 */

import Skeleton, { SkeletonCard, SkeletonMap } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <main className="p-6">
      {/* Title */}
      <Skeleton className="h-9 w-40 mb-2" />
      <Skeleton className="h-5 w-56 mb-6" />

      {/* Toggle + Count */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Map Skeleton */}
      <SkeletonMap />

      {/* List would show here on toggle */}
    </main>
  );
}
