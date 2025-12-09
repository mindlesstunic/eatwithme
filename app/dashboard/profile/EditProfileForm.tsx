/**
 * Edit Profile Form Component
 *
 * Client component that handles profile editing.
 * Pre-fills with existing data and validates before saving.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  influencer: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    instagram: string | null;
    youtube: string | null;
  };
};

export default function EditProfileForm({ influencer }: Props) {
  const router = useRouter();

  // ============================================
  // Form state - pre-filled with existing data
  // ============================================
  const [displayName, setDisplayName] = useState(influencer.displayName);
  const [bio, setBio] = useState(influencer.bio || "");
  const [instagram, setInstagram] = useState(influencer.instagram || "");
  const [youtube, setYoutube] = useState(influencer.youtube || "");

  // ============================================
  // UI state
  // ============================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ============================================
  // Handle form submission
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/influencer/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio: bio || null,
        instagram: instagram || null,
        youtube: youtube || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect after short delay to show success message
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ============================================
          Username (Read-only)
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
          <span className="bg-gray-100 px-3 py-3 text-gray-500">@</span>
          <input
            type="text"
            value={influencer.username}
            disabled
            className="flex-1 p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
      </div>

      {/* ============================================
          Display Name
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">Display Name *</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Tasty Adventures"
          required
        />
      </div>

      {/* ============================================
          Bio
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 border rounded-lg"
          placeholder="Food lover exploring the best eats in Hyderabad..."
          rows={3}
        />
      </div>

      {/* ============================================
          Instagram Handle
          ============================================ */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Instagram Handle
        </label>
        <div className="flex items-center border rounded-lg overflow-hidden">
          <span className="bg-gray-100 px-3 py-3 text-gray-500">@</span>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
            className="flex-1 p-3 outline-none"
            placeholder="your_instagram"
          />
        </div>
      </div>

      {/* ============================================
          YouTube Channel URL
          ============================================ */}
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

      {/* ============================================
          Error Message
          ============================================ */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* ============================================
          Success Message
          ============================================ */}
      {success && (
        <p className="text-sm text-green-600">
          Profile updated successfully! Redirecting...
        </p>
      )}

      {/* ============================================
          Action Buttons
          ============================================ */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !displayName.trim()}
          className="flex-1 p-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
