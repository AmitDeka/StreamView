"use client";

import { KickPlayer } from "@/components/kick/kick-player";
import { useMultiView } from "./multiview-context";
import { KICK_CHANNEL_BASE_URL } from "@/lib/config";
import { X, ExternalLink } from "lucide-react";

export function StreamTile({ stream, index, isSolo = false }) {
  const { removeStream } = useMultiView();

  if (!stream) return null;

  return (
    <div
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-surface-card border border-border/80 transition-all ${
        isSolo ? "w-full h-full min-h-[70vh]" : "w-full"
      }`}
    >
      {/* Top Header Bar for Tile */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface-elevated/95 border-b border-border/60 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={stream.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`}
            alt={stream.channelName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`;
            }}
            className="w-7 h-7 rounded-full border border-border/70 object-cover shrink-0 shadow-sm"
          />
          <span className="font-bold text-xs text-text-primary truncate">
            {stream.channelName}
          </span>
        </div>

        {/* Minimal Outer Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Open on Kick */}
          <a
            href={`${KICK_CHANNEL_BASE_URL}/${stream.channelName}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on Kick"
            aria-label="Open on Kick"
            className="p-1 rounded text-text-secondary hover:text-white hover:bg-surface-hover transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Remove Stream */}
          <button
            type="button"
            onClick={() => removeStream(stream.id)}
            title="Remove Stream"
            aria-label="Remove Stream"
            className="p-1 rounded text-text-secondary hover:text-brand-red hover:bg-surface-hover transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Kick Video Player Iframe */}
      <div className="relative aspect-video w-full bg-black">
        <KickPlayer channel={stream.channelName} />
      </div>

      {/* Stream Meta Footer */}
      <div className="px-3 py-2 bg-surface-card border-t border-border/40 flex items-center justify-between gap-2 text-xs">
        <p className="text-text-secondary truncate text-[11px]" title={stream.title}>
          {stream.title}
        </p>
        <span className="font-semibold text-brand-gold/90 text-[11px] shrink-0">
          {stream.category}
        </span>
      </div>
    </div>
  );
}
