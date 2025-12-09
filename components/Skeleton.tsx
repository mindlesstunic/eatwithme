/**
 * Skeleton Component
 *
 * Animated placeholder that shows while content is loading.
 * Use different variants for text, circles, or custom sizes.
 */

type Props = {
  className?: string;
};

export default function Skeleton({ className = "" }: Props) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

/**
 * Pre-built skeleton patterns for common use cases
 */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="border p-4 rounded-lg space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function SkeletonMap() {
  return <Skeleton className="w-full h-[400px] rounded-lg" />;
}
