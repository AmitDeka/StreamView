"use client";

import { useState, useEffect, useTransition } from "react";
import { useMultiView } from "./multiview-context";
import { StreamCard } from "./stream-card";
import { extractDiscoverySignals } from "@/lib/discovery/signals";
import { X, Search, Sparkles, Hash, Gamepad2, Loader2, Check, Radio } from "lucide-react";

export function AddStreamDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    selectedStreams,
    addStream,
    removeStream,
    activeReferenceStream,
    activeDrawerFilter,
    activeLayout,
  } = useMultiView();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  // Extract signals from active reference stream
  const signals = extractDiscoverySignals(activeReferenceStream);

  // Synchronize initial filter from context when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      setActiveFilter(activeDrawerFilter || "");
      setSearchQuery("");
    }
  }, [isDrawerOpen, activeDrawerFilter]);

  // Fetch streams (debounced) whenever searchQuery, activeFilter, or activeReferenceStream changes
  useEffect(() => {
    if (!isDrawerOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setErrorMsg("");

    const timeout = setTimeout(async () => {
      try {
        const excludeList = selectedStreams.map((s) => s.channelName);
        
        let url = "";
        if (searchQuery.trim()) {
          url = `/api/kick/search?q=${encodeURIComponent(searchQuery.trim())}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}`;
        } else if (activeReferenceStream) {
          url = `/api/kick/related?channel=${encodeURIComponent(
            activeReferenceStream.channelName
          )}&filter=${encodeURIComponent(activeFilter)}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}`;
        } else {
          url = `/api/kick/streams?limit=20`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load live streams");
        const json = await res.json();

        if (isMounted) {
          const list = json.data || [];
          setStreams(list);
          if (list.length === 0) {
            setErrorMsg("Couldn't find any live streams matching this criteria.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg("Live stream discovery is temporarily unavailable. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isDrawerOpen, searchQuery, activeFilter, activeReferenceStream, selectedStreams]);

  if (!isDrawerOpen) return null;

  const isFull = selectedStreams.length >= 6;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDrawer();
      }}
      className="fixed inset-0 z-[10000] flex justify-end bg-black/70 backdrop-blur-sm transition-opacity"
    >
      {/* Drawer Container */}
      <div className="relative w-full max-w-xl h-full bg-surface-elevated border-l border-border/80 flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">
                Add a Stream
              </h2>
              <p className="text-xs text-text-secondary">
                Discover related streams & expand your Multi View
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Reference Stream Context Banner (if one is currently active) */}
          {activeReferenceStream && (
            <div className="p-3.5 rounded-xl bg-surface-card border border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-brand-gold" />
                  Currently Watching
                </span>
                <span className="text-[10px] text-brand-gold/90 font-medium">
                  Reference Stream
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={activeReferenceStream.avatarUrl}
                  alt={activeReferenceStream.channelName}
                  className="w-9 h-9 rounded-full border border-border object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-primary truncate">
                      {activeReferenceStream.channelName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-brand-gold border border-brand-gold/30 shrink-0">
                      {activeReferenceStream.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5" title={activeReferenceStream.title}>
                    {activeReferenceStream.title}
                  </p>
                </div>
              </div>

              {/* Contextual Discovery Signals Chips */}
              {signals.suggestedChips.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <span className="text-[10px] font-semibold text-text-muted uppercase block mb-1.5">
                    Related to this stream:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* All option */}
                    <button
                      type="button"
                      onClick={() => setActiveFilter("")}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeFilter === ""
                          ? "bg-brand-gold text-black font-bold shadow-sm"
                          : "bg-surface-elevated text-text-secondary hover:text-white border border-border/60"
                      }`}
                    >
                      All Related
                    </button>

                    {/* Extracted chips */}
                    {signals.suggestedChips.map((chip, idx) => {
                      const isChipActive = activeFilter.toLowerCase() === chip.value.toLowerCase();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveFilter(isChipActive ? "" : chip.value);
                            setSearchQuery("");
                          }}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                            isChipActive
                              ? "bg-brand-orange text-white font-bold shadow-sm"
                              : "bg-surface-elevated text-text-primary hover:border-brand-orange/50 border border-border/70"
                          }`}
                        >
                          {chip.type === "hashtag" ? (
                            <Hash className="w-3 h-3 text-brand-gold" />
                          ) : (
                            <Gamepad2 className="w-3 h-3 text-brand-orange" />
                          )}
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search streamers, games or tags (e.g. #yatraroleplay)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-card border border-border/80 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/60 text-sm text-text-primary placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {searchQuery
                  ? "Search Results"
                  : activeFilter
                  ? `Streams matching "${activeFilter}"`
                  : activeReferenceStream
                  ? "Recommended Related Streams"
                  : "Live Streams"}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {streams.length} live
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-text-muted gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-brand-orange" />
                <span className="text-xs font-medium">Scanning live Kick streams...</span>
              </div>
            ) : errorMsg ? (
              <div className="py-10 px-4 rounded-xl bg-surface-card border border-border text-center space-y-2">
                <p className="text-sm text-text-secondary">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("");
                  }}
                  className="text-xs text-brand-gold hover:underline"
                >
                  Clear filters & view trending streams
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {streams.map((stream) => {
                  const isSelected = selectedStreams.some(
                    (s) => s.id === stream.id || s.channelName.toLowerCase() === stream.channelName.toLowerCase()
                  );

                  return (
                    <StreamCard
                      key={stream.id || stream.channelName}
                      stream={stream}
                      isSelected={isSelected}
                      disabled={!isSelected && isFull}
                      onSelect={(st) => {
                        if (isSelected) {
                          removeStream(st.id);
                        } else {
                          addStream(st);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/70 bg-surface-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Selected:</span>
            <span className="text-sm font-bold font-mono text-brand-gold">
              {selectedStreams.length}/6
            </span>
            {isFull && (
              <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/30">
                Max 6 Reached
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeDrawer}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-white hover:bg-surface-hover border border-border/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-brand-gradient text-white shadow-glow-sm hover:opacity-95 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
