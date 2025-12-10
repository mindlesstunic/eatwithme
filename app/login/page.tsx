/**
 * Login Page
 *
 * Handles both login and signup for influencers.
 * Styled with warm accent colors.
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to EatWithMe to manage your food recommendations.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setMessage(error);
      setIsError(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setMessage("Check your email for the confirmation link!");
        setIsError(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* ============================================
            Header
            ============================================ */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🍽️</span>
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? "Join EatWithMe" : "Welcome Back"}
          </h1>
          <p className="text-[var(--color-foreground-secondary)]">
            {isSignUp
              ? "Create your food recommendation map"
              : "Sign in to manage your recommendations"}
          </p>
        </div>

        {/* ============================================
            Form
            ============================================ */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center p-3 rounded-[var(--radius-md)] ${
                isError
                  ? "bg-red-50 text-[var(--color-error)] dark:bg-red-900/20"
                  : "bg-green-50 text-[var(--color-success)] dark:bg-green-900/20"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* ============================================
            Toggle Sign Up / Login
            ============================================ */}
        <p className="text-center mt-6 text-[var(--color-foreground-secondary)]">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="font-medium text-[var(--color-primary)] hover:opacity-80"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

        {/* ============================================
            Back Link
            ============================================ */}
        <p className="text-center mt-4">
          <Link
            href="/"
            className="text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
          >
            ← Back to discovery
          </Link>
        </p>
      </div>
    </main>
  );
}
