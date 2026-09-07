"use client";

import { useMultiView } from "./multiview-context";
import { StreamTile } from "./stream-tile";
import { StageView } from "./stage-view";
import { Plus } from "lucide-react";

export function StreamGrid() {
  const {
    selectedStreams,
    activeLayout,
    maximizedStreamId,
    toggleMaximizeStream,
    openDrawer,
    viewMode,
  } = useMultiView();

  // If user selected Stage View (Main Left + Sidecar Right)
  if (viewMode === "stage" && !maximizedStreamId) {
    return <StageView />;
  }

  // If a single stream is maximized to solo mode
  if (maximizedStreamId) {
    const soloStream = selectedStreams.find(
      (s) => s.id === maximizedStreamId || s.channelName === maximizedStreamId
    );
    if (soloStream) {
      return (
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-surface-elevated border border-brand-gold/40 text-xs">
            <span className="text-brand-gold font-semibold">
              Solo Mode: Watching {soloStream.channelName}
            </span>
            <button
              type="button"
              onClick={() => toggleMaximizeStream(soloStream.id)}
              className="px-3 py-1 rounded bg-brand-orange text-white font-medium hover:opacity-90 transition-opacity"
            >
              Exit Solo Mode
            </button>
          </div>
          <StreamTile stream={soloStream} index={0} isSolo={true} />
        </div>
      );
    }
  }

  const streamCount = selectedStreams.length;

  // Responsive grid classes based on exact stream count for Equal layout:
  // - 2 streams: 50% / 50% (grid-cols-2)
  // - 3 streams: 33.33% / 33.33% / 33.33% (grid-cols-3)
  // - 4 streams: 50% with 4 equal (2x2 grid: grid-cols-2)
  // - 5 & 6 streams ("after 5 same as 3"): 3 columns (grid-cols-3)
  const getGridClasses = () => {
    switch (streamCount) {
      case 1:
        return "grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
      case 2:
        return "grid grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid grid-cols-1 md:grid-cols-3";
      case 4:
        return "grid grid-cols-1 md:grid-cols-2";
      case 5:
      case 6:
      default:
        return "grid grid-cols-1 md:grid-cols-3";
    }
  };

  return (
    <div className={`w-full gap-4 ${getGridClasses()} items-center justify-center my-auto`}>
      {/* Selected Streams */}
      {selectedStreams.map((stream, idx) => (
        <StreamTile key={stream.id || stream.channelName} stream={stream} index={idx} />
      ))}

      {/* When only 1 stream is active, show 1 placeholder slot to prompt adding a second stream */}
      {streamCount === 1 && (
        <div
          onClick={() => openDrawer({ referenceIndex: 0 })}
          className="group relative aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 hover:border-brand-gold/70 bg-surface-card/60 hover:bg-surface-elevated/70 transition-all cursor-pointer p-6 text-center select-none"
        >
          <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border group-hover:border-brand-gold/60 group-hover:scale-110 flex items-center justify-center text-text-muted group-hover:text-brand-gold transition-all shadow-glow-sm mb-3">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-sm font-bold text-text-primary group-hover:text-brand-gold transition-colors">
            + Add a stream
          </span>
          <span className="text-xs text-text-muted mt-1 max-w-xs">
            Slot 2 of 6 · Discover related streams
          </span>
        </div>
      )}
    </div>
  );
}
