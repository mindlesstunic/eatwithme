"use client";

import { useState } from "react";

type Props = {
  userId: string;
  email: string;
};

export default function SetupProfile({ email }: Props) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/influencer/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        displayName,
        instagram,
        youtube,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          Set Up Your Profile
        </h1>
        <p className="text-[var(--color-foreground-secondary)] text-center mb-8">
          Choose your username to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="bg-gray-100 px-3 py-3 text-[var(--color-foreground-secondary)]">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                  )
                }
                className="flex-1 p-3 outline-none"
                placeholder="tasty_adventures"
                required
              />
            </div>
            <p className="text-xs text-[var(--color-foreground-muted)] mt-1">
              eatwithme.app/@{username || "username"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="Tasty Adventures"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Instagram Handle
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <span className="bg-gray-100 px-3 py-3 text-[var(--color-foreground-secondary)]">
                @
              </span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                className="flex-1 p-3 outline-none"
                placeholder="your_instagram"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube Channel URL
            </label>
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !displayName}
            className="w-full p-3 btn-primary rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
