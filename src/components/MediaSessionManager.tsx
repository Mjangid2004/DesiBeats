"use client";

import { ReactNode } from "react";
import { useMediaSession, useBackgroundPlayback } from "@/hooks/useMediaSession";

interface MediaSessionManagerProps {
  children: ReactNode;
}

export default function MediaSessionManager({ children }: MediaSessionManagerProps) {
  useMediaSession();
  useBackgroundPlayback();
  return <>{children}</>;
}