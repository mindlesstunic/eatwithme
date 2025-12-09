/**
 * Header Component
 *
 * Main navigation with logo, links, and auth state.
 * Responsive with mobile menu.
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* ============================================
              Logo
              ============================================ */}
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span>EatWithMe.app</span>
          </Link>

          {/* ============================================
              Desktop Navigation
              ============================================ */}
          <nav className="hidden sm:flex items-center gap-6">
            {loading ? (
              <span className="text-[var(--color-foreground-muted)] text-sm">
                ...
              </span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Join as Influencer
              </Link>
            )}
          </nav>

          {/* ============================================
              Mobile Menu Button
              ============================================ */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* ============================================
            Mobile Menu
            ============================================ */}
        {mobileMenuOpen && (
          <nav className="sm:hidden pt-4 pb-2 border-t border-[var(--color-border)] mt-4 space-y-3">
            {loading ? (
              <span className="text-[var(--color-foreground-muted)] text-sm">
                Loading...
              </span>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block py-2 text-sm text-[var(--color-foreground-secondary)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-primary block text-center text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join as Influencer
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
