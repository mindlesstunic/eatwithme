import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Recommendation Not Found</h1>
      <p className="text-[var(--color-foreground-secondary)] mb-6">
        This recommendation doesn't exist or was deleted.
      </p>
      <Link href="/dashboard" className="text-blue-600 hover:underline">
        ← Back to dashboard
      </Link>
    </main>
  );
}
