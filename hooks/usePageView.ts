"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

type PageViewParams = {
  influencerId?: string;
  placeId?: string;
};

export function usePageView({ influencerId, placeId }: PageViewParams = {}) {
  useEffect(() => {
    track({
      type: "page_view",
      influencerId,
      placeId,
      metadata: {
        url: window.location.pathname,
        referrer: document.referrer || null,
      },
    });
  }, [influencerId, placeId]);
}
