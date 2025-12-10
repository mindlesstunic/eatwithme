import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">🍽️</span>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-[var(--color-foreground-secondary)] mb-8">
          Oops! This page doesn't exist. Let's get you back to discovering great
          food spots.
        </p>
        <Link href="/" className="btn-primary inline-block">
          ← Back to Discovery
        </Link>
      </div>
    </main>
  );
}
