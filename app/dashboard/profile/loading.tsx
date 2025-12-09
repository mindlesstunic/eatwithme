/**
 * Edit Profile Loading State
 */

import Skeleton from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Skeleton className="h-9 w-40 mb-2" />
      <Skeleton className="h-5 w-64 mb-8" />

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
