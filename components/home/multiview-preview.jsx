"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  LayoutGrid,
  MonitorPlay,
  ArrowRight,
  Check,
  Plus,
  ArrowLeftRight,
  Volume2,
  RotateCcw,
} from "lucide-react";

const DUMMY_STREAMS = [
  {
    id: "dummy_1",
    channelName: "PixelKnight",
    category: "Grand Theft Auto V",
    viewerCount: "14.2K",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=pixelknight&backgroundColor=b6e3f4,c0aede",
  },
  {
    id: "dummy_2",
    channelName: "Officer_Vance",
    category: "Grand Theft Auto V",
    viewerCount: "9.5K",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=officervance&backgroundColor=ffd5dc,ffdfbf",
  },
  {
    id: "dummy_3",
    channelName: "NeonViper",
    category: "Grand Theft Auto V",
    viewerCount: "7.1K",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=neonviper&backgroundColor=d1d4f9,c0aede",
  },
];

export function MultiViewPreview() {
  const [addedIds, setAddedIds] = useState(["dummy_1"]);
  const [layoutMode, setLayoutMode] = useState("stage"); // "stage" or "grid"
  const [mainStageId, setMainStageId] = useState("dummy_1");

  const toggleStream = (id) => {
    setAddedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((item) => item !== id);
        if (mainStageId === id) setMainStageId(next[0] || "dummy_1");
        return next;
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSwap = () => {
    setMainStageId((prev) => (prev === "dummy_1" ? "dummy_2" : "dummy_1"));
  };

  const resetDemo = () => {
    setAddedIds(["dummy_1"]);
    setMainStageId("dummy_1");
    setLayoutMode("stage");
  };

  const stream1 = DUMMY_STREAMS[0]; // PixelKnight
  const stream2 = DUMMY_STREAMS[1]; // Officer_Vance
  const stream3 = DUMMY_STREAMS[2]; // NeonViper

  const isStream1Added = addedIds.includes(stream1.id);
  const isStream2Added = addedIds.includes(stream2.id);
  const isStream3Added = addedIds.includes(stream3.id);

  const activeMain = DUMMY_STREAMS.find((s) => s.id === mainStageId) || stream1;
  const activeSide = mainStageId === "dummy_1" ? stream2 : stream1;

  const steps = [
    {
      number: "01",
      title: "Find Your First Stream",
      category: "Discovery & Search",
      description:
        "Search by username or #hashtag to load your first live stream into the Multi View workspace.",
      badgeColor: "border-brand-gold/60 text-brand-gold",
      accentBg: "from-brand-gold/10 to-transparent",
      icon: Search,
      uiPreview: (
        <div className="w-full p-3 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Simple Search Bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border/60 text-xs text-text-muted">
            <Search className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span className="text-text-primary font-mono text-xs">#yatraroleplay</span>
          </div>

          {/* Simple Streamer Card */}
          <div className="p-3 rounded-lg bg-black/50 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={stream1.avatarUrl}
                  alt={stream1.channelName}
                  className="w-9 h-9 rounded-full border border-brand-gold/40 object-cover shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs block truncate">
                    {stream1.channelName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                    <span>{stream1.category}</span>
                    <span>•</span>
                    <span className="text-live font-semibold">🔴 {stream1.viewerCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Add Button */}
            <button
              type="button"
              onClick={() => toggleStream(stream1.id)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isStream1Added
                  ? "bg-live/20 text-live border border-live/50 shadow-glow-sm"
                  : "bg-brand-gold hover:bg-brand-orange text-black shadow-sm"
              }`}
            >
              {isStream1Added ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Stream Added (1/6)</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Add Stream</span>
                </>
              )}
            </button>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Contextual Discovery",
      category: "Smart Signal Matching",
      description:
        "StreamView automatically finds other live streams playing in the same server or game.",
      badgeColor: "border-brand-orange/60 text-brand-orange",
      accentBg: "from-brand-orange/10 to-transparent",
      icon: Sparkles,
      uiPreview: (
        <div className="w-full p-3 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Signal Indicator */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-md bg-brand-orange/15 border border-brand-orange/30 text-brand-orange">
            <span className="font-semibold">Auto-matched:</span>
            <span className="font-mono font-bold text-white">#yatraroleplay</span>
          </div>

          {/* 2 Simple Connected Streamer Rows */}
          <div className="space-y-1.5">
            {[stream2, stream3].map((s) => {
              const isAdded = addedIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-black/50 border border-border/60 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={s.avatarUrl}
                      alt={s.channelName}
                      className="w-7 h-7 rounded-full border border-border object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-white text-[11px] block truncate">
                        {s.channelName}
                      </span>
                      <span className="text-[10px] text-live font-semibold block">
                        🔴 {s.viewerCount}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStream(s.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                      isAdded
                        ? "bg-live/20 text-live border border-live/40"
                        : "bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange border border-brand-orange/40"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Customize Layout Grid",
      category: "Stage View & Equal Grid",
      description:
        "Toggle between Stage View with a featured player and instant Swap, or a balanced Equal Grid.",
      badgeColor: "border-brand-red/60 text-brand-red",
      accentBg: "from-brand-red/10 to-transparent",
      icon: LayoutGrid,
      uiPreview: (
        <div className="w-full p-3 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Simple 2-Tab Switcher */}
          <div className="flex items-center bg-surface-elevated p-1 rounded-lg border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode("stage")}
              className={`flex-1 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                layoutMode === "stage"
                  ? "bg-brand-gold text-black shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Stage View (3:1)
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("grid")}
              className={`flex-1 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                layoutMode === "grid"
                  ? "bg-brand-gold text-black shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Equal Grid
            </button>
          </div>

          {/* Simple Visual Preview */}
          {layoutMode === "stage" ? (
            <div className="space-y-1.5">
              {/* Featured Main Stage */}
              <div className="p-2 rounded-lg bg-black/80 border border-brand-gold/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white block">
                    {activeMain.channelName}
                  </span>
                  <span className="text-[10px] text-brand-gold font-medium">
                    Main Stage · 🔴 {activeMain.viewerCount}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-live font-bold bg-live/15 px-2 py-0.5 rounded border border-live/30">
                  <Volume2 className="w-3 h-3" /> Audio
                </span>
              </div>

              {/* Sidecar Swap Row */}
              <div className="p-2 rounded-lg bg-surface-elevated border border-border/70 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-white block truncate">
                    {activeSide.channelName}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Sidecar · 🔴 {activeSide.viewerCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSwap}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-black border border-brand-gold/40 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Swap</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2.5 rounded-lg bg-black/60 border border-border/70 text-center">
                <span className="text-[11px] font-bold text-white block truncate">
                  {stream1.channelName}
                </span>
                <span className="text-[10px] text-live font-semibold">
                  🔴 {stream1.viewerCount}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-border/70 text-center">
                <span className="text-[11px] font-bold text-white block truncate">
                  {stream2.channelName}
                </span>
                <span className="text-[10px] text-live font-semibold">
                  🔴 {stream2.viewerCount}
                </span>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      number: "04",
      title: "Watch Simultaneously",
      category: "Official Embeds & Cockpit",
      description:
        "Synchronized multi-stream viewing powered by Kick's official embed players with zero lag.",
      badgeColor: "border-brand-pink/60 text-brand-pink",
      accentBg: "from-brand-pink/10 to-transparent",
      icon: MonitorPlay,
      uiPreview: (
        <div className="w-full p-3 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Synchronized Screen Preview */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-lg bg-black/80 border border-border/60">
            <div className="p-2 rounded bg-surface-elevated/70 border border-border/50 text-center">
              <span className="text-[10px] font-bold text-white block truncate">
                {stream1.channelName}
              </span>
              <span className="text-[9px] text-live font-semibold">🔴 Live</span>
            </div>
            <div className="p-2 rounded bg-surface-elevated/70 border border-border/50 text-center">
              <span className="text-[10px] font-bold text-white block truncate">
                {stream2.channelName}
              </span>
              <span className="text-[9px] text-live font-semibold">🔴 Live</span>
            </div>
          </div>

          {/* Embed Status Pill */}
          <div className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-border/60 flex items-center justify-between text-[10px]">
            <span className="text-text-secondary">Official Kick Players</span>
            <span className="text-brand-gold font-semibold">● Synced</span>
          </div>

          {/* Simple Add Stream Button */}
          <button
            type="button"
            onClick={() => {
              if (!isStream2Added) {
                toggleStream(stream2.id);
              } else if (!isStream3Added) {
                toggleStream(stream3.id);
              } else {
                resetDemo();
              }
            }}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-brand-gold hover:bg-brand-orange text-black shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Stream ({addedIds.length}/6)</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-surface-elevated border border-brand-gold/40 text-[11px] sm:text-xs font-semibold text-brand-gold mb-2.5 sm:mb-3 shadow-glow-sm">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Simple Step-by-Step Guide</span>
        </div>
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 sm:mb-3">
          How <span className="text-gradient">StreamView</span> Works
        </h2>
        <p className="text-xs sm:text-base text-text-secondary leading-relaxed px-2">
          From choosing your first streamer to watching multiple synchronized players. Simple, clean, and fast.
        </p>

        {/* Unobtrusive Reset Option */}
        {addedIds.length > 1 && (
          <button
            type="button"
            onClick={resetDemo}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-brand-gold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset demo</span>
          </button>
        )}
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl bg-surface-card border border-border/80 hover:border-brand-gold/60 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 shadow-lg bg-gradient-to-b ${step.accentBg}`}
            >
              <div>
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-black font-mono text-gradient">
                    {step.number}
                  </span>
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-elevated border flex items-center justify-center ${step.badgeColor} shadow-sm`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                {/* Step Title & Description */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  {step.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mb-1.5 sm:mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4 sm:mb-5">
                  {step.description}
                </p>
              </div>

              {/* Step UI Mockup Preview */}
              <div className="mt-auto pt-2 border-t border-border/40">
                {step.uiPreview}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-elevated border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white">
            Ready to build your Multi View?
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            Watch multiple Kick live streams together with zero configuration.
          </p>
        </div>
        <Link
          href="/multi-view"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-brand-gradient text-white shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Launch Multi View</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
