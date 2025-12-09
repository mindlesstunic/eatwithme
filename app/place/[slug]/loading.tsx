/**
 * Place Detail Loading State
 *
 * Shows skeleton UI while place details load.
 */

import Skeleton, { SkeletonCard } from "@/components/Skeleton";

export default function PlaceLoading() {
  return (
    <main className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
        <Skeleton className="h-5 w-72 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Directions Button */}
      <Skeleton className="h-12 w-40 rounded-lg mb-8" />

      {/* Recommendations Header */}
      <Skeleton className="h-7 w-48 mb-4" />

      {/* Recommendation Cards */}
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  );
}
