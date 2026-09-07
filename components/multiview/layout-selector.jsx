"use client";

import { useMultiView } from "./multiview-context";
import { SUPPORTED_LAYOUTS } from "@/lib/config";
import { Square, Columns2, Grid2X2, Grid3X3, LayoutGrid, PanelRight } from "lucide-react";

const LAYOUT_ICONS = {
  1: Square,
  2: Columns2,
  3: Grid3X3,
  4: Grid2X2,
  6: LayoutGrid,
};

export function LayoutSelector() {
  const {
    activeLayout,
    setActiveLayout,
    selectedStreams,
    viewMode,
    setViewMode,
  } = useMultiView();

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Mode Selector: Stage View (User's sketch) vs Equal Grid */}
      <div className="flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-border/70">
        <button
          type="button"
          onClick={() => setViewMode("stage")}
          title="Stage View: Main stream on left, click right tiles to swap"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            viewMode === "stage"
              ? "bg-brand-gold text-black font-bold shadow-sm"
              : "text-text-secondary hover:text-white hover:bg-surface-hover"
          }`}
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Stage View</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("grid")}
          title="Equal Grid View: Standard 2x2 or 3x2 grid"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            viewMode === "grid"
              ? "bg-brand-gold text-black font-bold shadow-sm"
              : "text-text-secondary hover:text-white hover:bg-surface-hover"
          }`}
        >
          <Grid2X2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Equal Grid</span>
        </button>
      </div>

      {/* Stream Count Indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border/70 text-xs font-semibold text-text-secondary">
        <span className="text-text-muted">Streams:</span>
        <span className="text-brand-gold font-mono">
          {selectedStreams.length}/{activeLayout}
        </span>
      </div>

      {/* Layout Count Buttons */}
      <div className="flex items-center gap-1 bg-surface-card p-1 rounded-lg border border-border/70">
        {SUPPORTED_LAYOUTS.map((count) => {
          const Icon = LAYOUT_ICONS[count] || Square;
          const isActive = activeLayout === count;

          return (
            <button
              key={count}
              type="button"
              onClick={() => setActiveLayout(count)}
              title={`${count} Stream Layout`}
              aria-label={`${count} Stream Layout`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand-gradient text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-white hover:bg-surface-hover"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
