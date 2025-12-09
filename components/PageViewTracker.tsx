"use client";

import { usePageView } from "@/hooks/usePageView";

type Props = {
  influencerId?: string;
  placeId?: string;
};

export default function PageViewTracker({ influencerId, placeId }: Props) {
  usePageView({ influencerId, placeId });
  return null;
}