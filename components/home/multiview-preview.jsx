import Link from "next/link";
import {
  Search,
  Sparkles,
  LayoutGrid,
  MonitorPlay,
  ArrowRight,
  Radio,
  Hash,
  Gamepad2,
  Plus,
  Maximize2,
  CheckCircle2,
} from "lucide-react";

export function MultiViewPreview() {
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border/60 text-xs text-text-muted">
            <Search className="w-3.5 h-3.5 text-brand-gold shrink-0" />
            <span className="text-text-primary font-mono text-[11px] truncate">
              #yatraroleplay
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-border/40 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-live"></span>
              <span className="font-bold text-text-primary truncate text-[11px]">
                Prathmesh_Gaming
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-brand-gold/20 text-brand-gold text-[10px] font-bold border border-brand-gold/40">
              + Added
            </span>
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
            Extracted Discovery Signals:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-brand-orange/20 text-brand-orange border border-brand-orange/40 font-semibold">
              <Hash className="w-3 h-3 text-brand-gold" />
              #yatraroleplay
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-surface-elevated text-text-secondary border border-border/70">
              <Gamepad2 className="w-3 h-3 text-brand-orange" />
              GTA V
            </span>
          </div>
          <div className="text-[11px] text-text-muted flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-3 h-3 text-live shrink-0" />
            <span>Ranked by hashtag & title term priority</span>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Customize Layout Grid",
      category: "1 to 6 Streams",
      description:
        "Select between 1, 2, 3, 4, or 6 stream layouts. Fill empty slots directly or switch between grid modes anytime without losing active streams.",
      badgeColor: "border-brand-red/60 text-brand-red",
      accentBg: "from-brand-red/10 to-transparent",
      icon: LayoutGrid,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Layout Selector
            </span>
            <span className="text-[10px] font-mono text-brand-gold font-bold">
              Streams: 3/4
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-surface-elevated p-1 rounded-lg border border-border/60 text-center text-xs">
            <span className="py-1 rounded text-text-muted">1</span>
            <span className="py-1 rounded text-text-muted">2</span>
            <span className="py-1 rounded text-text-muted">3</span>
            <span className="py-1 rounded bg-brand-gradient text-white font-bold shadow-sm">
              4
            </span>
            <span className="py-1 rounded text-text-muted">6</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
              Stream 1
            </div>
            <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
              Stream 2
            </div>
            <div className="h-6 rounded bg-black/50 border border-border/60 flex items-center justify-center text-[9px] text-text-muted">
              Stream 3
            </div>
            <div className="h-6 rounded border border-dashed border-brand-gold/60 bg-brand-gold/10 flex items-center justify-center text-[9px] text-brand-gold font-bold">
              + Add
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "04",
      title: "Watch Simultaneously",
      category: "Official Kick Embeds",
      description:
        "Enjoy synchronous multi-angle viewing powered by Kick's official embed players. Solo/maximize any stream, open external channels, or remove streams easily.",
      badgeColor: "border-brand-pink/60 text-brand-pink",
      accentBg: "from-brand-pink/10 to-transparent",
      icon: MonitorPlay,
      uiPreview: (
        <div className="w-full p-3.5 rounded-xl bg-surface-card border border-border/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
              </span>
              <span className="text-[10px] font-bold uppercase text-live">
                Synchronized
              </span>
            </div>
            <span className="text-[10px] text-text-muted">Official Player</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/60 border border-border/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-text-secondary truncate">
              Individual Tile Controls
            </span>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
              <Radio className="w-3.5 h-3.5 text-live" />
            </div>
          </div>
          <div className="text-[10px] text-text-muted text-center pt-1">
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
