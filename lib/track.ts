/**
 * Event Tracking Module
 *
 * Sends analytics events to the server.
 * Uses debouncing to prevent overwhelming the database with rapid clicks.
 */

import { getSessionId } from "./session";

type EventType =
  | "page_view"
  | "direction_click"
  | "video_click"
  | "marker_click"
  | "list_view"
  | "map_view";

type TrackParams = {
  type: EventType;
  placeId?: string;
  influencerId?: string;
  recommendationId?: string;
  metadata?: Record<string, unknown>;
};

// ============================================
// Debounce cache to prevent duplicate events
// ============================================
const recentEvents = new Map<string, number>();
const DEBOUNCE_MS = 2000; // Ignore duplicate events within 2 seconds

export async function track({
  type,
  placeId,
  influencerId,
  recommendationId,
  metadata,
}: TrackParams) {
  const sessionId = getSessionId();
  if (!sessionId) return;

  // ============================================
  // Create a unique key for this event
  // ============================================
  const eventKey = `${type}-${placeId || ""}-${influencerId || ""}-${
    recommendationId || ""
  }`;
  const now = Date.now();
  const lastFired = recentEvents.get(eventKey);

  // ============================================
  // Skip if same event fired recently (debounce)
  // ============================================
  if (lastFired && now - lastFired < DEBOUNCE_MS) {
    return;
  }

  recentEvents.set(eventKey, now);

  // ============================================
  // Clean up old entries to prevent memory leak
  // ============================================
  if (recentEvents.size > 100) {
    const cutoff = now - DEBOUNCE_MS;
    for (const [key, time] of recentEvents) {
      if (time < cutoff) {
        recentEvents.delete(key);
      }
    }
  }

  // ============================================
  // Fire and forget - don't await
  // ============================================
  fetch("/api/event/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      placeId,
      influencerId,
      recommendationId,
      sessionId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }),
  }).catch((error) => {
    // Silent fail - don't break UX for tracking
    console.error("Tracking error:", error);
  });
}
