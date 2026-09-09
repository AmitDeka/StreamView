"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  LayoutGrid,
  MonitorPlay,
  ArrowRight,
  Hash,
  Gamepad2,
  Check,
  Plus,
  User,
  ArrowLeftRight,
  Maximize2,
  PanelRight,
  Grid2X2,
} from "lucide-react";

export function MultiViewPreview() {
  const [step1Added, setStep1Added] = useState(false);
  const [selectedChip, setSelectedChip] = useState("hashtag");
  const [step2Added, setStep2Added] = useState(false);
  const [demoViewMode, setDemoViewMode] = useState("stage");
  const [swapped, setSwapped] = useState(false);

  const handleSwapClick = () => {
    setSwapped(true);
    setTimeout(() => setSwapped(false), 1200);
  };

  const steps = [
    {
      number: "01",
      title: "Find Your First Stream",
      category: "Discovery & Search",
      description:
        "Search by streamer name, game category, or trending hashtag (such as #yatraroleplay or GTA V) to load your first live stream into the workspace.",
      badgeColor: "border-brand-gold/60 text-brand-gold",
      accentBg: "from-brand-gold/10 to-transparent",
      icon: Search,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Demo Search Box */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border/60 text-xs text-text-muted">
            <Search className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span className="text-text-primary font-mono text-[11px] truncate">
              #yatraroleplay
            </span>
          </div>

          {/* Demo Streamer Result */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-border/60 text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-surface-elevated border border-brand-gold/40 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-brand-gold" />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-text-primary truncate text-[11px]">
                  Demo_Streamer
                </span>
                <span className="text-[9px] text-text-muted truncate">
                  GTA V · Roleplay
                </span>
              </div>
            </div>

            {/* Interactive Demo Button */}
            <button
              type="button"
              onClick={() => setStep1Added(!step1Added)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                step1Added
                  ? "bg-live/20 text-live border border-live/50 shadow-glow-sm"
                  : "bg-brand-gold hover:bg-brand-orange text-black shadow-sm"
              }`}
            >
              {step1Added ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add Stream</span>
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
        'Click "+ Add a stream". StreamView scans the current stream\'s title, hashtags, and game category to automatically prioritize connected live streamers.',
      badgeColor: "border-brand-orange/60 text-brand-orange",
      accentBg: "from-brand-orange/10 to-transparent",
      icon: Sparkles,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
            Extracted Contextual Signals:
          </span>

          {/* Interactive Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedChip(selectedChip === "hashtag" ? null : "hashtag")}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedChip === "hashtag"
                  ? "bg-brand-orange text-black shadow-sm"
                  : "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange/25"
              }`}
            >
              <Hash className="w-3 h-3" />
              <span>#yatraroleplay</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedChip(selectedChip === "game" ? null : "game")}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedChip === "game"
                  ? "bg-brand-gold text-black shadow-sm"
                  : "bg-surface-elevated text-text-secondary border border-border/70 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3 h-3 text-brand-gold" />
              <span>GTA V</span>
            </button>
          </div>

          {/* Demo Recommended Streamer Row */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-border/40 text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-text-muted" />
              </div>
              <span className="font-semibold text-text-secondary truncate text-[11px]">
                Demo_Partner
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep2Added(!step2Added)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                step2Added
                  ? "bg-live/20 text-live border border-live/40"
                  : "bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange border border-brand-orange/40"
              }`}
            >
              {step2Added ? "✓ Added" : "+ Add (2/6)"}
            </button>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Customize Layout Grid",
      category: "Stage View & Equal Grid",
      description:
        "Choose between Stage View with a featured main stage and scrollable sidecar with instant Swap, or balanced Equal Grid (50/50, 33%, 2x2, up to 6 streams).",
      badgeColor: "border-brand-red/60 text-brand-red",
      accentBg: "from-brand-red/10 to-transparent",
      icon: LayoutGrid,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Layout Mode Switcher */}
          <div className="flex items-center justify-between gap-1 bg-surface-elevated p-1 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setDemoViewMode("stage")}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                demoViewMode === "stage"
                  ? "bg-brand-gold text-black shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <PanelRight className="w-3 h-3" />
              <span>Stage View</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                demoViewMode === "grid"
                  ? "bg-brand-gold text-black shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <Grid2X2 className="w-3 h-3" />
              <span>Equal Grid</span>
            </button>
          </div>

          {/* Visual Mini Diagram */}
          {demoViewMode === "stage" ? (
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {/* Left Main Stage (3 cols) */}
              <div className="col-span-3 h-14 rounded-lg bg-black/60 border border-brand-gold/40 p-1.5 flex flex-col justify-between">
                <span className="text-[9px] font-mono text-brand-gold font-bold">
                  {swapped ? "⇄ Swapped!" : "Main Stage"}
                </span>
                <span className="text-[8px] text-text-muted">Featured Player</span>
              </div>
              {/* Right Sidecar (2 cols) */}
              <div className="col-span-2 flex flex-col gap-1">
                <div className="h-6 rounded bg-surface-elevated border border-border/70 p-1 flex items-center justify-between">
                  <span className="text-[8px] text-text-secondary truncate">Stream 2</span>
                  <button
                    type="button"
                    onClick={handleSwapClick}
                    className="px-1 py-0.5 rounded text-[8px] font-bold bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/30 border border-brand-gold/30 flex items-center gap-0.5 transition-colors cursor-pointer"
                    title="Swap into Main Stage"
                  >
                    <ArrowLeftRight className="w-2.5 h-2.5" />
                    <span>Swap</span>
                  </button>
                </div>
                <div className="h-6 rounded bg-surface-elevated border border-border/70 p-1 flex items-center justify-between">
                  <span className="text-[8px] text-text-secondary truncate">Stream 3</span>
                  <button
                    type="button"
                    onClick={handleSwapClick}
                    className="px-1 py-0.5 rounded text-[8px] font-bold bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/30 border border-brand-gold/30 flex items-center gap-0.5 transition-colors cursor-pointer"
                    title="Swap into Main Stage"
                  >
                    <ArrowLeftRight className="w-2.5 h-2.5" />
                    <span>Swap</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
                50% Stream 1
              </div>
              <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
                50% Stream 2
              </div>
              <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
                Stream 3
              </div>
              <div className="h-6 rounded border border-dashed border-brand-gold/60 bg-brand-gold/10 flex items-center justify-center text-[9px] text-brand-gold font-bold">
                + Add (3/4)
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      number: "04",
      title: "Watch Simultaneously",
      category: "Official Embeds & Fullscreen",
      description:
        "Enjoy synchronous viewing powered by Kick's official embed players. Enter native Fullscreen for maximum viewing space, and add new streams directly inside fullscreen.",
      badgeColor: "border-brand-pink/60 text-brand-pink",
      accentBg: "from-brand-pink/10 to-transparent",
      icon: MonitorPlay,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          {/* Fullscreen Demo Bar */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-black/60 border border-border/60 text-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white">
              <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
              <span>Fullscreen Active</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold text-[9px] font-bold border border-brand-gold/30">
              + Add Stream
            </span>
          </div>

          {/* Official Embed Status */}
          <div className="p-2 rounded-lg bg-surface-elevated border border-border/60 flex items-center justify-between text-xs">
            <span className="text-[10px] text-text-secondary">
              Official Kick Embed
            </span>
            <span className="text-[10px] font-mono text-brand-gold">
              ESC to Exit
            </span>
          </div>

          <div className="text-[10px] text-text-muted text-center pt-0.5">
            Zero video tampering · Pure official iframe
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-brand-gold/40 text-xs font-semibold text-brand-gold mb-3 shadow-glow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step-by-Step Workflow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          How <span className="text-gradient">StreamView</span> Works
        </h2>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          From selecting your first streamer to enjoying multiple synchronized Kick players in
          seconds. Simple, fast, and engineered for multi-perspective viewing.
        </p>
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl bg-surface-card border border-border/80 hover:border-brand-gold/60 p-5 transition-all duration-300 hover:-translate-y-1 shadow-lg bg-gradient-to-b ${step.accentBg}`}
            >
              <div>
                {/* Step Number & Icon Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-gradient">
                    {step.number}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl bg-surface-elevated border flex items-center justify-center ${step.badgeColor} shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Step Title & Description */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  {step.category}
                </span>
                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-5">
                  {step.description}
                </p>
              </div>

              {/* Step Interactive UI Mockup Preview */}
              <div className="mt-auto pt-2 border-t border-border/40">
                {step.uiPreview}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Banner */}
      <div className="p-6 rounded-2xl bg-surface-elevated border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-base font-bold text-white">
            Ready to build your Multi View?
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            No signups or complex configuration required. Jump straight into the workspace.
          </p>
        </div>
        <Link
          href="/multi-view"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-brand-gradient text-white shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Launch Multi View</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
