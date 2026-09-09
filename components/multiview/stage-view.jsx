"use client";

import { useState, useEffect, useRef } from "react";
import { useMultiView } from "./multiview-context";
import { StreamTile } from "./stream-tile";
import { KickPlayer } from "@/components/kick/kick-player";
import { Plus, X, ExternalLink, ArrowLeftRight } from "lucide-react";
import { KICK_CHANNEL_BASE_URL } from "@/lib/config";

export function StageView() {
  const {
    selectedStreams,
    activeLayout,
    focusStream,
    removeStream,
    openDrawer,
  } = useMultiView();

  const leftStageRef = useRef(null);
  const [stageHeight, setStageHeight] = useState(null);

  if (selectedStreams.length === 0) return null;

  const mainStream = selectedStreams[0];
  const sideStreams = selectedStreams.slice(1);
  const totalCount = selectedStreams.length;
  const isFourToSix = totalCount >= 4; // After 3 streams (4, 5, 6 streams): use current one!
  const isTwoStreams = totalCount === 2;
  const isSingleStream = totalCount === 1;
  const canAddMore = totalCount < 6;
  const isSixStreams = totalCount >= 6;

  // Continuously sync left and right side boxes to the exact same height
  useEffect(() => {
    if (!leftStageRef.current) return;

    const updateHeight = () => {
      if (leftStageRef.current) {
        const h = leftStageRef.current.offsetHeight;
        if (h > 0) {
          setStageHeight(h);
        }
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });

    ro.observe(leftStageRef.current);
    window.addEventListener("resize", updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [totalCount, isFourToSix, mainStream?.id]);

  // Responsive stage vs sidecar ratios:
  // - 1 to 3 streams: 3:1 flex ratio (Left 75%, Right 25%)
  // - 4 to 6 streams: Current layout (Left ~55%, Right ~45% with 2-column grid)
  const leftWidthClass = isFourToSix
    ? "w-full lg:w-[55%] xl:w-[56%]"
    : "w-full lg:w-[75%]";

  const rightWidthClass = isFourToSix
    ? "w-full lg:w-[45%] xl:w-[44%]"
    : "w-full lg:w-[25%]";

  // Responsive height for right scrollable container:
  // - After adding 6 streams: Expands to 82vh (capped at 760px on large displays) so the 3-row, 5-card grid is comfortable
  // - 1 to 5 streams: Strictly synced to the Left Stage height
  // Responsive height for right scrollable container:
  // - On Mobile: Auto height with smooth horizontal scrolling strip
  // - On Desktop (lg:): Synced to Left Stage height or 82vh when 6 streams
  const rightHeightClass = isSixStreams
    ? "h-auto max-h-none lg:h-[82vh] lg:max-h-[82vh] xl:max-h-[760px]"
    : "h-auto max-h-none lg:h-[var(--stage-height)] lg:max-h-[var(--stage-height)]";

  return (
    <div
      style={{ "--stage-height": stageHeight ? `${stageHeight}px` : "auto" }}
      className="w-full flex flex-col lg:flex-row gap-4 lg:items-start justify-center my-auto"
    >
      {/* Mobile Mode Notice Pill (< lg screens) */}
      <div className="flex lg:hidden items-center justify-between px-3.5 py-2 rounded-xl bg-surface-card border border-border/70 text-[11px] text-text-muted mb-1 w-full">
        <span className="flex items-center gap-1.5 font-medium text-text-secondary">
          <span>📱</span>
          <span>Mobile Multi View: Tap any streamer card to swap onto main player</span>
        </span>
        <span className="text-brand-gold font-semibold text-[10px] shrink-0">
          6 streams on desktop
        </span>
      </div>

      {/* LEFT: Featured Main Stream (Stage) */}
      <div className={`${leftWidthClass} flex flex-col transition-all duration-300`}>
        <div
          ref={leftStageRef}
          className="relative w-full rounded-2xl overflow-hidden bg-surface-card border-2 border-brand-gold/50 shadow-2xl"
        >
          {/* Main Stage Top Indicator */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface-elevated/95 border-b border-border/70 z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-gold text-black">
                Main Stage
              </span>
              <img
                src={mainStream.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${mainStream.channelName}&backgroundColor=b6e3f4,c0aede`}
                alt={mainStream.channelName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${mainStream.channelName}&backgroundColor=b6e3f4,c0aede`;
                }}
                className="w-7 h-7 rounded-full border border-border/80 object-cover shrink-0 shadow-sm"
              />
              <span className="font-bold text-sm text-text-primary truncate">
                {mainStream.channelName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={`${KICK_CHANNEL_BASE_URL}/${mainStream.channelName}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open on Kick"
                className="p-1.5 rounded text-text-secondary hover:text-white hover:bg-surface-hover transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => removeStream(mainStream.id)}
                title="Remove Stream"
                className="p-1.5 rounded text-text-secondary hover:text-brand-red hover:bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Large Kick Video Player */}
          <div className="relative aspect-video w-full bg-black">
            <KickPlayer channel={mainStream.channelName} />
          </div>

          {/* Main Stage Meta Footer */}
          <div className="px-4 py-2.5 bg-surface-card border-t border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-text-primary truncate" title={mainStream.title}>
                {mainStream.title}
              </h2>
              <p className="text-xs text-brand-gold font-medium mt-0.5">
                {mainStream.category}
              </p>
            </div>
            <span className="text-[11px] text-text-muted hidden sm:inline-flex items-center gap-1.5 flex-wrap">
              <span>Click <strong className="text-brand-gold font-bold">Swap</strong> on any card to fill this stage</span>
              <span className="text-border/80">·</span>
              <span>Go full screen with the button below</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Secondary Streams (Adaptive: Horizontal Switcher Strip on Mobile, Live Embeds on Desktop) */}
      <div
        className={`${rightWidthClass} flex flex-col gap-2.5 ${rightHeightClass} overflow-y-auto p-3 rounded-2xl bg-[#180A12]/90 border border-border/70 border-l-4 border-l-brand-gold/80 visible-scroll-container shadow-xl transition-all duration-300`}
      >
        {/* Mobile Header / Quick Switcher Label */}
        {sideStreams.length > 0 && (
          <div className="flex lg:hidden items-center justify-between px-1 text-xs">
            <span className="font-bold text-text-primary flex items-center gap-1.5">
              <span>Stream Switcher</span>
              <span className="text-[10px] text-brand-gold font-mono">({sideStreams.length} standby)</span>
            </span>
            <span className="text-[10px] text-text-muted">Tap card to watch on main</span>
          </div>
        )}

        {/* When 4 to 6 streams: arrange in a 2-column grid on desktop. On mobile: horizontal swipeable strip */}
        {sideStreams.length > 0 && (
          <div
            className={
              isFourToSix
                ? "flex flex-row lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0"
                : "flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0"
            }
          >
            {sideStreams.map((stream) => (
              <SidecarTile
                key={stream.id || stream.channelName}
                stream={stream}
                onFocus={() => focusStream(stream.id)}
                onRemove={() => removeStream(stream.id)}
              />
            ))}
          </div>
        )}

        {/* STATE A (1 Stream): Show card UI so there are always 2 cards minimum */}
        {isSingleStream && (
          <div
            onClick={() => openDrawer({ referenceIndex: 0 })}
            className="group relative flex-1 w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 hover:border-brand-gold/70 bg-surface-card/60 hover:bg-surface-elevated/70 transition-all cursor-pointer p-5 text-center select-none min-h-[140px] sm:min-h-[200px]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-elevated border border-border group-hover:border-brand-gold flex items-center justify-center text-text-muted group-hover:text-brand-gold transition-all mb-2 shadow-sm">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-text-primary group-hover:text-brand-gold transition-colors">
              + Add a stream
            </span>
            <span className="text-[11px] text-text-muted mt-0.5 max-w-xs">
              Slot 2 · Click to discover side-by-side stream
            </span>
          </div>
        )}

        {/* STATE B (2 to 5 Streams): PROPER BUTTON with NO CARD UI */}
        {canAddMore && !isSingleStream && (
          <button
            type="button"
            onClick={() => openDrawer({ referenceIndex: 0 })}
            className="group flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-surface-card hover:bg-surface-elevated text-brand-gold border border-border/80 hover:border-brand-gold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <div className="w-5 h-5 rounded-md bg-brand-gold/20 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-black transition-colors">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>+ Add a stream ({totalCount}/6)</span>
          </button>
        )}

        {/* STATE C (6 Streams reached): Maximum limit indicator */}
        {!canAddMore && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-surface-elevated/80 border border-border/60 text-xs text-text-muted font-medium text-center">
            <span>Maximum 6 streams active</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SidecarTile renders an individual stream in the sidecar grid/column.
 * Supports:
 * - Desktop (>= 1024px): 16:9 widescreen video embed with KickPlayer
 * - Mobile (< 1024px): Touch-friendly preview with Tap-to-Swap (prevents browser freezing & data waste)
 * - Header Swap button to fill left main stage
 * - Direct stream removal
 */
function SidecarTile({ stream, onFocus, onRemove }) {
  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-surface-card border border-border/80 hover:border-brand-gold/70 hover:shadow-glow-gold transition-all duration-200 select-none shrink-0 w-[240px] sm:w-[280px] lg:w-full">
      {/* Tile Header */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-elevated border-b border-border/40 text-xs shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <img
            src={stream.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`}
            alt={stream.channelName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${stream.channelName}&backgroundColor=b6e3f4,c0aede`;
            }}
            className="w-5 h-5 rounded-full border border-border/80 object-cover shrink-0 shadow-sm"
          />
          <span className="font-bold text-text-primary text-[11px] truncate">
            {stream.channelName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Subtle Swap Button (Less Contrast) */}
          <button
            type="button"
            onClick={() => onFocus(stream.id)}
            title="Swap to Main Stage"
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold/90 hover:bg-brand-gold/25 hover:text-brand-gold border border-brand-gold/30 hover:border-brand-gold/60 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-2.5 h-2.5 stroke-[2.5]" />
            <span>Swap</span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(stream.id)}
            className="p-1 text-text-muted hover:text-brand-red rounded hover:bg-surface-hover transition-colors"
            title="Remove stream"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* DESKTOP (lg:): Full Kick Player Live Embed */}
      <div className="hidden lg:block relative aspect-video w-full bg-black">
        <KickPlayer channel={stream.channelName} muted={true} />
      </div>

      {/* MOBILE (< lg:): Clean thumbnail with Tap to Swap (no heavy background iframe) */}
      <div
        onClick={() => onFocus(stream.id)}
        className="block lg:hidden relative aspect-video w-full bg-black cursor-pointer group/thumb"
      >
        <img
          src={stream.thumbnailUrl}
          alt={stream.title}
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-2">
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-live text-white font-extrabold text-[9px] uppercase shadow">
              LIVE
            </span>
            {stream.viewerCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-black/75 text-white text-[9px] font-medium border border-white/10">
                {stream.viewerCount >= 1000
                  ? `${(stream.viewerCount / 1000).toFixed(1)}k`
                  : stream.viewerCount}
              </span>
            )}
          </div>
          <div className="flex items-center justify-center">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-gold text-black font-bold text-[10px] shadow-md group-hover/thumb:scale-105 transition-transform">
              <ArrowLeftRight className="w-3 h-3 stroke-[2.5]" />
              <span>Tap to Watch</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Small Title */}
      <div className="px-2.5 py-1.5 bg-surface-card flex items-center justify-between text-[10px] text-text-secondary gap-1 shrink-0">
        <span className="truncate flex-1" title={stream.title}>
          {stream.title}
        </span>
        <span className="text-brand-gold font-semibold shrink-0">
          {stream.category}
        </span>
      </div>
    </div>
  );
}