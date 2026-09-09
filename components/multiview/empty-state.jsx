"use client";

import { useState, useEffect } from "react";
import { useMultiView } from "./multiview-context";
import { StreamCard } from "./stream-card";
import { TRENDING_TAGS } from "@/lib/config";
import { Search, Sparkles, Flame, Loader2, User, Hash, Gamepad2 } from "lucide-react";

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
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 flex flex-col items-center text-center">
      {/* Visual Accent */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-brand-gold/40 text-xs font-semibold text-brand-gold mb-6 shadow-glow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Live Kick Discovery Engine</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
        Build Your <span className="text-gradient">Multi View</span>
      </h1>
      <p className="text-sm sm:text-base text-text-secondary max-w-xl mb-8 leading-relaxed">
        Browse currently live Kick streams below or search by streamer username, game category, or #hashtag to start your Multi View.
      </p>

      {/* Search Input Box (Optional Search) */}
      <div className="w-full max-w-2xl relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (activeTag) setActiveTag("");
          }}
          placeholder="Search by username (e.g. xqc), category (GTA V), or #hashtag..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-surface-card border border-border/90 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/40 text-text-primary text-sm sm:text-base placeholder:text-text-muted shadow-2xl transition-all"
        />
      </div>

      {/* Trending Tags (Quick Filters) */}
      <div className="w-full max-w-2xl flex items-center justify-center flex-wrap gap-2 mb-10">
        <span className="text-xs font-bold text-text-muted uppercase flex items-center gap-1.5 mr-1">
          <Flame className="w-3.5 h-3.5 text-brand-orange" />
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
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
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
        <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {term ? `Matching Streams for "${term}" (${streams.length})` : `Currently Live on Kick (${streams.length})`}
            </span>
          </div>
          <span className="text-xs text-text-muted">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
