"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-md">
        <span className="text-6xl mb-6 block">😅</span>
        <h1 className="text-3xl font-bold mb-2">Something Went Wrong</h1>
        <p className="text-[var(--color-foreground-secondary)] mb-8">
          We hit an unexpected error. Try refreshing the page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/" className="btn-secondary">
            Go Home
          </a>
        </div>
        {error.digest && (
          <p className="text-xs text-[var(--color-foreground-muted)] mt-8">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
