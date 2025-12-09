/**
 * Add Place Loading State
 */

import Skeleton from "@/components/Skeleton";

export default function AddPlaceLoading() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Skeleton className="h-9 w-36 mb-8" />

      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full rounded-lg" />

        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </main>
  );
}
