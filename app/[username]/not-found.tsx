import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">🔍</span>
        <h1 className="text-3xl font-bold mb-2">Influencer Not Found</h1>
        <p className="text-[var(--color-foreground-secondary)] mb-8">
          We couldn't find this profile. The username might be incorrect or the
          influencer hasn't joined yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Discover Places
          </Link>
          <Link href="/login" className="btn-secondary">
            Join as Influencer
          </Link>
        </div>
      </div>
    </main>
  );
}
