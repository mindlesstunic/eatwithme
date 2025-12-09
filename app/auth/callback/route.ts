/**
 * Auth Callback Handler
 *
 * Handles email confirmation using token_hash (PKCE flow).
 * Verifies the token and redirects to dashboard.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // ============================================
  // Get params - Supabase sends token_hash + type
  // ============================================
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");

  const supabase = await createClient();

  // ============================================
  // Handle token_hash flow (email confirmation)
  // ============================================
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email",
    });

    if (error) {
      console.error("Token verification error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // ============================================
  // Handle code flow (OAuth)
  // ============================================
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Code exchange error:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // ============================================
  // No valid params - redirect to login
  // ============================================
  return NextResponse.redirect(`${origin}/login`);
}
