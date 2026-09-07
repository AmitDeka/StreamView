"use client";

import { useState } from "react";
import { KICK_PLAYER_BASE_URL } from "@/lib/config";
import { Loader2 } from "lucide-react";

/**
 * Official Kick Embed Player Component.
 * Receives channel/stream identifier and loads Kick's official embed iframe.
 * Does not proxy, restream, or manipulate the video stream.
 */
export function KickPlayer({ channel, autoplay = true, muted = false, className = "" }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!channel) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-text-muted">
        <span>No channel specified</span>
      </div>
    );
  }

  // Clean channel name (remove any accidental whitespace or symbols)
  const cleanChannel = encodeURIComponent(channel.trim());
  const embedUrl = `${KICK_PLAYER_BASE_URL}/${cleanChannel}?autoplay=${autoplay}&muted=${muted}`;

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden select-none ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card z-10">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
          <span className="text-xs text-text-secondary font-medium tracking-wide">
            Loading official Kick player for {channel}...
          </span>
        </div>
      )}

      {/* Official Kick Embed Iframe */}
      <iframe
        src={embedUrl}
        title={`Kick Live Stream - ${channel}`}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
