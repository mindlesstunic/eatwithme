"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          EatWithMe
        </Link>

        <nav className="flex items-center gap-4">
          {loading ? (
            <span className="text-gray-400 text-sm">...</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
