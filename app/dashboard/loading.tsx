/**
 * Dashboard Loading State
 *
 * Shows skeleton UI while dashboard loads.
 */

import Skeleton, { SkeletonCard } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Recommendations Section */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  );
}
