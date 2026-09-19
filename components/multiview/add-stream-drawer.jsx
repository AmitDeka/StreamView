"use client";

import { useState, useEffect, useRef } from "react";
import { useMultiView } from "./multiview-context";
import { StreamCard } from "./stream-card";
import { extractDiscoverySignals } from "@/lib/discovery/signals";
import { TRENDING_TAGS } from "@/lib/config";
import { SearchTipBanner } from "@/components/common/search-tip-banner";
import { getKnownYatraParam, saveYatraChannel } from "@/lib/discovery/client-storage";
import { X, Search, Sparkles, Hash, Gamepad2, Loader2, Check, Radio, Flame, Plus } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/youtube/resolve";

function isYouTubeInput(str) {
  if (!str) return false;
  const s = String(str).trim();
  return (
    s.includes("youtube.com") ||
    s.includes("youtu.be") ||
    Boolean(extractYouTubeVideoId(s))
  );
}

export function AddStreamDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    selectedStreams,
    addStream,
    removeStream,
    activeReferenceStream,
    activeDrawerFilter,
  } = useMultiView();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(20);
  const [errorMsg, setErrorMsg] = useState("");
  const [ytStream, setYtStream] = useState(null);
  const [isYtResolving, setIsYtResolving] = useState(false);
  const [ytError, setYtError] = useState("");

  const prevQueryFilterRef = useRef("");
  const firstStream = selectedStreams[0] || activeReferenceStream;

  const signals = extractDiscoverySignals(firstStream);

  useEffect(() => {
    if (isDrawerOpen) {
      setSearchQuery("");
      const defaultFilter = activeDrawerFilter || "";
      setActiveFilter(defaultFilter);
      setLimit(20);
      setHasMore(true);
      prevQueryFilterRef.current = `|${defaultFilter.trim()}`;
      setYtStream(null);
      setIsYtResolving(false);
      setYtError("");
    }
  }, [isDrawerOpen, activeDrawerFilter]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isDrawerOpen || !isYouTubeInput(trimmed)) {
      setYtStream(null);
      setIsYtResolving(false);
      setYtError("");
      return;
    }

    let isMounted = true;
    setIsYtResolving(true);
    setYtError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/youtube/resolve?url=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setYtStream(json.data);
            setYtError("");
          } else {
            setYtStream(null);
            setYtError(json.error || "Could not resolve YouTube stream from this link");
          }
        }
      } catch (err) {
        if (isMounted) {
          setYtStream(null);
          setYtError("Failed to resolve YouTube stream");
        }
      } finally {
        if (isMounted) {
          setIsYtResolving(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isDrawerOpen, searchQuery]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    let isMounted = true;
    setErrorMsg("");

    const currentKey = `${searchQuery.trim()}|${activeFilter.trim()}`;
    const isNewFilter = prevQueryFilterRef.current !== currentKey;
    if (isNewFilter) {
      prevQueryFilterRef.current = currentKey;
      if (limit !== 20) {
        setLimit(20);
      }
    }

    if (searchQuery && isYouTubeInput(searchQuery)) {
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    const currentLimit = isNewFilter ? 20 : limit;

    if (currentLimit === 20) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const hasSearch = Boolean(searchQuery.trim());
    const hasFilter = Boolean(activeFilter.trim());

    const timeout = setTimeout(async () => {
      try {
        const excludeList = selectedStreams.map((s) => s.channelName);
        const known = getKnownYatraParam();
        const knownQuery = known ? `&known=${encodeURIComponent(known)}` : "";
        
        let url = "";
        if (hasSearch) {
          url = `/api/kick/search?q=${encodeURIComponent(searchQuery.trim())}&limit=${currentLimit}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}${knownQuery}`;
        } else if (hasFilter) {
          const refChannel = firstStream?.channelName || activeReferenceStream?.channelName || "";
          url = `/api/kick/related?channel=${encodeURIComponent(
            refChannel
          )}&filter=${encodeURIComponent(activeFilter)}&limit=${currentLimit}&exclude=${encodeURIComponent(
            excludeList.join(",")
          )}${knownQuery}`;
        } else {
          const refChannel = firstStream?.channelName || activeReferenceStream?.channelName || "";
          url = `/api/kick/related?channel=${encodeURIComponent(
            refChannel
          )}&filter=&limit=${currentLimit}&exclude=${encodeURIComponent(excludeList.join(","))}${knownQuery}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load live streams");
        const json = await res.json();

        if (isMounted) {
          const list = json.data || [];
          setStreams(list);
          setHasMore(list.length >= currentLimit);

          for (const s of list) {
            const t = (s.title || "").toLowerCase();
            const tags = (s.tags || []).map((x) => String(x).toLowerCase());
            if (t.includes("yatra") || tags.some((x) => x.includes("yatra"))) {
              saveYatraChannel(s.channelName);
            }
          }

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
          setIsLoadingMore(false);
        }
      }
    }, currentLimit === 20 ? 280 : 0);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isDrawerOpen, searchQuery, activeFilter, limit, firstStream, activeReferenceStream, selectedStreams]);

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
      <div className="relative w-full max-w-full sm:max-w-xl h-full bg-surface-elevated border-l border-border/80 flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-border/60 bg-surface-card flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                Add a Stream
              </h2>
              <p className="text-[11px] sm:text-xs text-text-secondary">
                Dedicated to Yatra RP · Discover related live streams
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 sm:space-y-4">
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
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin touch-pan-x sm:flex-wrap">
                    {/* All option */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("");
                        setLimit(20);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
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
                            setLimit(20);
                          }}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
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
                setLimit(20);
              }}
              placeholder="Search by username, #hashtag, or paste YouTube URL..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-card border border-border/80 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/60 text-xs sm:text-sm text-text-primary placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setLimit(20);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-white rounded-md transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* YouTube Paste Notice */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface-card border border-border/70 text-[11px] text-text-muted">
            <span className="flex items-center gap-1.5 text-text-secondary font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-[#FF0000] shrink-0" />
              <span className="truncate">Paste any YouTube live stream or video link</span>
            </span>
            <span className="text-text-muted text-[10px] shrink-0 hidden xs:inline ml-1">watch, youtu.be, /live</span>
          </div>

          {/* YouTube Resolving State */}
          {isYtResolving && (
            <div className="p-3.5 rounded-xl bg-surface-card border border-red-500/40 flex items-center justify-center gap-2.5 shadow-md">
              <Loader2 className="w-4 h-4 text-[#FF0000] animate-spin" />
              <span className="text-xs text-text-primary font-medium">
                Resolving YouTube stream details...
              </span>
            </div>
          )}

          {/* YouTube Stream Detected Card */}
          {ytStream && (
            <div className="p-3.5 rounded-xl bg-surface-card border-2 border-red-500/60 shadow-lg flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="relative aspect-video w-32 rounded-lg overflow-hidden bg-black shrink-0">
                  <img
                    src={ytStream.thumbnailUrl}
                    alt={ytStream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#FF0000] text-white font-extrabold text-[9px] uppercase shadow-md">
                    YouTube
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-xs text-text-primary truncate block">
                    {ytStream.channelName}
                  </span>
                  <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5" title={ytStream.title}>
                    {ytStream.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isFull}
                onClick={() => {
                  const added = addStream(ytStream);
                  if (added) {
                    setSearchQuery("");
                    setYtStream(null);
                    closeDrawer();
                  }
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#FF0000] hover:bg-[#CC0000] text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isFull ? "Multi View is Full (Max 6)" : "Add YouTube Stream to Grid"}</span>
              </button>
            </div>
          )}

          {/* YouTube Resolve Error */}
          {ytError && isYouTubeInput(searchQuery) && (
            <div className="p-3 rounded-xl bg-surface-card border border-red-500/40 text-xs text-red-400">
              {ytError}
            </div>
          )}

          {/* Discovery Tip Banner */}
          <SearchTipBanner
            className="w-full"
            onExampleClick={(name) => {
              setSearchQuery(name);
              setActiveFilter("");
              setLimit(20);
            }}
          />

          {/* Quick Trending Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin touch-pan-x sm:flex-wrap">
            <span className="text-[10px] font-bold text-text-muted uppercase flex items-center gap-1 mr-1 shrink-0">
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
                    setLimit(20);
                  }}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
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
                      onClick={() => {
                        setActiveFilter("");
                        setLimit(20);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-gold text-black text-xs font-bold hover:bg-brand-gold/90 transition-all shadow-sm"
                    >
                      Show All Related Streams
                    </button>
                  )}
                </div>
              ) : (
                <>
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

                  {/* Load More Streams Button */}
                  {streams.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-center gap-1.5 pb-2">
                      {hasMore ? (
                        <button
                          type="button"
                          onClick={() => setLimit((prev) => prev + 20)}
                          disabled={isLoadingMore}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-border/80 hover:border-brand-gold/50 text-text-primary text-xs font-semibold transition-all shadow-sm hover:shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                              <span>Loading more streams...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-brand-gold group-hover:rotate-12 transition-transform" />
                              <span>Load More Streams (+20)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <p className="text-[11px] text-text-muted">
                          All {streams.length} live streams loaded
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border/70 bg-surface-card flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-text-muted">Selected:</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-brand-gold">
              {selectedStreams.length}/6
            </span>
            {isFull && (
              <span className="text-[10px] text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded border border-brand-orange/30">
                Max 6
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeDrawer}
              className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:text-white hover:bg-surface-hover border border-border/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg text-xs font-bold bg-brand-gradient text-white shadow-glow-sm hover:opacity-95 transition-opacity"
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
