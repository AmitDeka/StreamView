"use client";

import { useState, useEffect, useTransition } from "react";
import { useMultiView } from "./multiview-context";
import { StreamCard } from "./stream-card";
import { extractDiscoverySignals } from "@/lib/discovery/signals";
import { TRENDING_TAGS } from "@/lib/config";
import { X, Search, Sparkles, Hash, Gamepad2, Loader2, Check, Radio, Flame, User } from "lucide-react";

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

  // First streamer (reference stream is selectedStreams[0] or activeReferenceStream)
  const firstStream = selectedStreams[0] || activeReferenceStream;

  // Extract signals from active reference stream
  const signals = extractDiscoverySignals(firstStream);

  // Synchronize initial filter: defaults to All Related unless an explicit filter was requested
  useEffect(() => {
    if (isDrawerOpen) {
      setSearchQuery("");
      const defaultFilter = activeDrawerFilter || "";
      setActiveFilter(defaultFilter);
    }
  }, [isDrawerOpen, activeDrawerFilter]);

  // Fetch streams (debounced) whenever searchQuery or activeFilter changes
  useEffect(() => {
    if (!isDrawerOpen) return;

    let isMounted = true;
    setErrorMsg("");
    setIsLoading(true);

    const hasSearch = Boolean(searchQuery.trim());
    const hasFilter = Boolean(activeFilter.trim());

    const timeout = setTimeout(async () => {
      try {
        const excludeList = selectedStreams.map((s) => s.channelName);
        
        let url = "";
        if (hasSearch) {
          url = `/api/kick/search?q=${encodeURIComponent(searchQuery.trim())}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}`;
        } else if (hasFilter) {
          const refChannel = firstStream?.channelName || activeReferenceStream?.channelName || "";
          url = `/api/kick/related?channel=${encodeURIComponent(
            refChannel
          )}&filter=${encodeURIComponent(activeFilter)}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}`;
        } else {
          const refChannel = firstStream?.channelName || activeReferenceStream?.channelName || "";
          url = `/api/kick/related?channel=${encodeURIComponent(
            refChannel
          )}&filter=&exclude=${encodeURIComponent(excludeList.join(","))}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load live streams");
        const json = await res.json();

        if (isMounted) {
          const list = json.data || [];
          setStreams(list);
          if (list.length === 0) {
            setErrorMsg(`No live streams found matching "${searchQuery.trim() || activeFilter}".`);
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
  }, [isDrawerOpen, searchQuery, activeFilter, firstStream, activeReferenceStream, selectedStreams]);

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

              {/* Reference Stream Details */}
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

              {/* Auto-matching notification when hashtag filter is active */}
              {activeFilter && activeFilter.startsWith("#") && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-orange/15 border border-brand-orange/40 text-xs text-brand-orange">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-brand-gold animate-pulse" />
                  <span className="truncate">
                    Auto-filtering by first streamer&apos;s hashtag:{" "}
                    <strong className="font-bold text-white font-mono bg-black/40 px-1.5 py-0.5 rounded border border-brand-orange/30">
                      {activeFilter}
                    </strong>
                  </span>
                </div>
              )}

              {/* Contextual Discovery Signals Chips */}
              {signals.suggestedChips.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-text-muted uppercase">
                      First Streamer Signals:
                    </span>
                    {activeFilter && (
                      <span className="text-[10px] text-brand-gold font-medium">
                        Active: <span className="font-bold">{activeFilter}</span>
                      </span>
                    )}
                  </div>
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
                              ? "bg-brand-orange text-white font-bold shadow-sm ring-1 ring-brand-gold/60"
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeFilter) setActiveFilter("");
              }}
              placeholder="Search by username (e.g. xqc), category (GTA V), or #hashtag..."
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

          {/* Quick Trending Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1 mr-1">
              <Flame className="w-3 h-3 text-brand-orange" />
              Trending:
            </span>
            {TRENDING_TAGS.map((tag) => {
              const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      setSearchQuery("");
                    } else {
                      setSearchQuery(tag);
                      setActiveFilter("");
                    }
                  }}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand-orange text-white font-semibold shadow-sm"
                      : "bg-surface-card hover:bg-surface-hover text-text-secondary hover:text-white border border-border/70 hover:border-brand-gold/50"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                {searchQuery ? (
                  `Results for "${searchQuery}"`
                ) : activeFilter && activeFilter.startsWith("#") ? (
                  <>
                    <Hash className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Live streams with <span className="text-brand-gold font-bold font-mono">{activeFilter}</span></span>
                  </>
                ) : activeFilter ? (
                  `Live streams in "${activeFilter}"`
                ) : (
                  "Live Related Streams"
                )}
              </span>
              <span className="text-xs text-text-muted font-mono">
                {streams.length} live
              </span>
            </div>

            {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-text-muted gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-brand-gold" />
                  <span className="text-xs font-medium">Searching Kick for &quot;{searchQuery || activeFilter}&quot;...</span>
                </div>
              ) : errorMsg ? (
                <div className="py-10 px-4 rounded-xl bg-surface-card border border-border text-center space-y-3">
                  <p className="text-sm text-text-primary font-medium">{errorMsg}</p>
                  <p className="text-xs text-text-muted">
                    No other active Kick streamers are broadcasting with this exact tag right now.
                  </p>
                  {activeFilter && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter("")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-gold text-black text-xs font-bold hover:bg-brand-gold/90 transition-all shadow-sm"
                    >
                      Show All Related Streams
                    </button>
                  )}
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
