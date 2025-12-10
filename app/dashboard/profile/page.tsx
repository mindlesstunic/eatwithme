/**
 * Edit Profile Page
 *
 * Allows influencers to update their display name, bio, and social links.
 * Username is shown but not editable (permanent URL).
 */

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EditProfileForm from "./EditProfileForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your EatWithMe profile information.",
};
export default async function EditProfilePage() {
  // ============================================
  // 1. Verify authentication
  // ============================================
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ============================================
  // 2. Get influencer profile
  // ============================================
  const influencer = await prisma.influencer.findUnique({
    where: { authId: user.id },
  });

  if (!influencer) {
    redirect("/dashboard");
  }

  // ============================================
  // 3. Render edit form
  // ============================================
  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
      <p className="text-[var(--color-foreground-secondary)] mb-8">
        Update your public profile information
      </p>

      <EditProfileForm influencer={influencer} />
    </main>
  );
}
