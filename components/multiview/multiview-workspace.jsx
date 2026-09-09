"use client";

import { useRef } from "react";
import { useMultiView } from "./multiview-context";
import { EmptyState } from "./empty-state";
import { StreamGrid } from "./stream-grid";
import { AddStreamDrawer } from "./add-stream-drawer";
import { extractDiscoverySignals } from "@/lib/discovery/signals";
import { useFullscreen } from "@/lib/use-fullscreen";
import {
  Plus,
  Trash2,
  Sparkles,
  Hash,
  Gamepad2,
  LayoutDashboard,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from "lucide-react";

export function MultiViewWorkspace() {
  const {
    selectedStreams,
    activeReferenceStream,
    openDrawer,
    clearAllStreams,
    activeLayout,
    viewMode,
    setViewMode,
  } = useMultiView();

  const arenaRef = useRef(null);
  const { isFullscreen: isArenaFs, toggleFullscreen: toggleArenaFs } = useFullscreen(arenaRef);

  const mainStream = selectedStreams[0] || null;
  const signals = extractDiscoverySignals(mainStream);

  return (
    <div className="w-full flex-1 flex flex-col justify-center px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      {selectedStreams.length === 0 ? (
        <>
          <EmptyState />
          <AddStreamDrawer />
        </>
      ) : (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col justify-center my-auto gap-3.5">
          {/* Main Video Area: Stage View (Left Main + Right Sidecar Streams) */}
          <div
            ref={arenaRef}
            className={`w-full transition-all duration-300 ${
              isArenaFs
                ? "fixed inset-0 z-[9999] w-screen h-screen bg-bg-base py-1 px-3 sm:px-4 overflow-y-auto flex flex-col items-center"
                : "w-full flex flex-col justify-center my-auto"
            }`}
          >
            {isArenaFs && (
              <div className="w-full max-w-[1800px] flex items-center justify-between py-1 px-2 mb-1 border-b border-border/50 text-[11px] shrink-0">
                <span className="font-bold text-brand-gold">
                  Multi View Arena · {selectedStreams.length} Active Streams
                </span>
                <div className="flex items-center gap-2">
                  {selectedStreams.length < 6 && (
                    <button
                      type="button"
                      onClick={() => openDrawer()}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-gold hover:bg-brand-orange text-black hover:text-white font-bold text-[11px] transition-all shadow-sm"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+ Add Stream ({selectedStreams.length}/6)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleArenaFs}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-elevated text-text-primary border border-border text-[11px] transition-colors"
                  >
                    <Minimize2 className="w-3 h-3 text-brand-gold" />
                    <span>Exit Fullscreen (ESC)</span>
                  </button>
                </div>
              </div>
            )}
            <div className="w-full max-w-[1800px] my-auto flex flex-col justify-center">
              <StreamGrid />
            </div>

            {/* Slide-out Discovery Drawer - Mounted inside arenaRef for HTML5 Fullscreen support */}
            <AddStreamDrawer />
          </div>

          {/* USER'S SKETCH: Bottom Bar with Channel Info and Add Button */}
          {mainStream && (
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-card border border-border/80 shadow-xl">
              {/* Left Section: Active Channel Info */}
              <div className="flex items-center gap-3.5 min-w-0 max-w-xl">
                <img
                  src={mainStream.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${mainStream.channelName}&backgroundColor=b6e3f4,c0aede`}
                  alt={mainStream.channelName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${mainStream.channelName}&backgroundColor=b6e3f4,c0aede`;
                  }}
                  className="w-10 h-10 rounded-full border border-border object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text-primary truncate">
                      {mainStream.channelName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-surface-elevated text-brand-gold border border-brand-gold/30 shrink-0 font-medium">
                      {mainStream.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5" title={mainStream.title}>
                    {mainStream.title}
                  </p>
                </div>

                {/* Related signals quick chips from active main stream */}
                {signals.suggestedChips.length > 0 && (
                  <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-border/60">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-gold" />
                      Signals:
                    </span>
                    {signals.suggestedChips.slice(0, 2).map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openDrawer({ filter: chip.value })}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface-elevated text-brand-gold hover:bg-brand-orange/20 border border-border hover:border-brand-gold/50 transition-colors"
                      >
                        {chip.type === "hashtag" ? <Hash className="w-3 h-3" /> : <Gamepad2 className="w-3 h-3" />}
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Section: Layout Option, Reset, and Add Stream */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap self-end lg:self-auto">
                {/* User's sketch: Layout Option (Desktop/Tablet >= 1024px) */}
                <div className="hidden lg:flex items-center bg-surface-elevated p-1 rounded-xl border border-border/70">
                  <button
                    type="button"
                    onClick={() => setViewMode("stage")}
                    title="Stage View (Featured Left + Sidecar 2-Col Grid)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === "stage"
                        ? "bg-brand-gold text-black font-bold shadow-sm"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Stage View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Equal Grid View"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === "grid"
                        ? "bg-brand-gold text-black font-bold shadow-sm"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Equal Grid</span>
                  </button>
                </div>

                {/* Fullscreen Video Stage Div Toggle */}
                <button
                  type="button"
                  onClick={toggleArenaFs}
                  title={isArenaFs ? "Exit Fullscreen (ESC)" : "Go Fullscreen with Video Stage"}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-white border border-border/70 transition-colors"
                >
                  {isArenaFs ? (
                    <Minimize2 className="w-3.5 h-3.5 text-brand-gold" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isArenaFs ? "Exit Fullscreen" : "Fullscreen"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => clearAllStreams()}
                  title="Clear all streams"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-brand-red hover:bg-surface-hover border border-border/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Grid</span>
                </button>

                {selectedStreams.length < 6 ? (
                  <button
                    type="button"
                    onClick={() => openDrawer()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-gradient text-white shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Add Stream ({selectedStreams.length}/6)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-text-muted bg-surface-elevated border border-border/60">
                    <span>Max 6 Streams</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
