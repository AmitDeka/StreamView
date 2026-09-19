"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function YouTubePlayer({ videoId, autoplay = true, muted = false, className = "" }) {
  const [isLoading, setIsLoading] = useState(true);

  if (!videoId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-text-muted">
        <span>No YouTube video specified</span>
      </div>
    );
  }

  const cleanVideoId = encodeURIComponent(String(videoId).trim());
  const embedUrl = `https://www.youtube-nocookie.com/embed/${cleanVideoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0`;

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden select-none ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card z-10">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
          <span className="text-xs text-text-secondary font-medium tracking-wide">
            Loading official YouTube player...
          </span>
        </div>
      )}

      {/* Official YouTube Embed Iframe */}
      <iframe
        src={embedUrl}
        title={`YouTube Live Stream - ${cleanVideoId}`}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
