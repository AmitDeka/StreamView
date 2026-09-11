"use client";

import { useState, useEffect } from "react";
import { useMultiView } from "./multiview-context";
import { StreamCard } from "./stream-card";
import { TRENDING_TAGS } from "@/lib/config";
import { Search, Sparkles, Flame, Loader2, User, Hash, Gamepad2, Heart } from "lucide-react";

export function EmptyState() {
  const { addStream } = useMultiView();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const term = (query || activeTag || "").trim();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const url = term ? `/api/kick/search?q=${encodeURIComponent(term)}` : `/api/kick/search?q=`;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setStreams(json.data || []);
          }
        }
      } catch (e) {
        console.warn("Failed to load live streams", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, term ? 250 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [term]);

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-10 px-2 sm:px-4 flex flex-col items-center text-center">
      {/* Dedication Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-[11px] sm:text-xs font-bold text-brand-gold mb-4 sm:mb-6 shadow-glow-sm">
        <Heart className="w-3.5 h-3.5 fill-brand-gold text-brand-gold animate-pulse" />
        <span>Dedicated to the Yatra RP Community</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 sm:mb-4">
        Build Your <span className="text-gradient">Multi View</span>
      </h1>
      <p className="text-xs sm:text-base text-text-secondary max-w-xl mb-5 sm:mb-8 leading-relaxed px-2">
        This platform is dedicated to the <span className="text-brand-gold font-semibold">Yatra RP community</span>. Browse currently live Yatra Roleplay and Kick streams below, or search by streamer username, category, or #hashtag to start your Multi View.
      </p>

      {/* Search Input Box */}
      <div className="w-full max-w-2xl relative mb-4 sm:mb-6">
        <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (activeTag) setActiveTag("");
          }}
          placeholder="Search by username, category, or #hashtag..."
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-surface-card border border-border/90 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 text-text-primary text-xs sm:text-base placeholder:text-text-muted shadow-2xl transition-all"
        />
      </div>

      {/* Trending Tags (Quick Filters) */}
      <div className="w-full max-w-2xl flex items-center justify-start sm:justify-center overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin touch-pan-x sm:flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-10">
        <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase flex items-center gap-1 sm:gap-1.5 mr-1 shrink-0">
          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-orange" />
          Trending:
        </span>
        {TRENDING_TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (isActive) {
                  setActiveTag("");
                } else {
                  setActiveTag(tag);
                  setQuery("");
                }
              }}
              className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-medium transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-brand-orange text-white shadow-glow-sm"
                  : "bg-surface-elevated text-text-secondary hover:text-white border border-border/70 hover:border-brand-gold/50"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Stream Results (Live Kick Streams by Default) */}
      <div className="w-full text-left mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 border-b border-border/50 pb-2 gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted truncate">
              {term ? `Matching Streams for "${term}" (${streams.length})` : `Currently Live on Kick (${streams.length})`}
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-text-muted">
            Click &quot;+ Add&quot; to add to Multi View
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-text-muted gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
            <span className="text-sm font-medium">
              {term ? `Searching Kick for "${term}"...` : "Loading currently live Kick streams..."}
            </span>
          </div>
        ) : streams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {streams.map((stream) => (
              <StreamCard
                key={stream.id || stream.channelName}
                stream={stream}
                isSelected={false}
                onSelect={(st) => addStream(st)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-text-muted">
            <p className="text-sm font-semibold text-text-primary mb-1">
              {term ? `No live streams found for "${term}"` : "No live Kick streams currently available"}
            </p>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              Try searching by exact channel name, game category (GTA V, Just Chatting), or community hashtag (#yatraroleplay).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
