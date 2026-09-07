import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles, Radio } from "lucide-react";
import { APP_TAGLINE } from "@/lib/config";

export function HomeHero() {
  return (
    <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-orange/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* Live Discovery Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated border border-brand-gold/40 text-xs font-semibold text-brand-gold mb-8 shadow-glow-sm animate-pulseGlow">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live"></span>
          </span>
          <span>Official Kick Embeds · Contextual Discovery</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
          Watch Multiple Streams <br className="hidden sm:inline" />
          <span className="text-gradient">Together</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
          Discover related live Kick streams and build your own custom Multi View. Follow your favorite roleplay stories, competitive tournaments, and gaming events simultaneously.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/multi-view"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-bold bg-brand-gradient text-white shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LayoutGrid className="w-5 h-5" />
            <span>Start Multi View</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold bg-surface-elevated text-text-primary border border-border/80 hover:border-brand-gold/50 hover:bg-surface-hover transition-colors"
          >
            <span>See How It Works</span>
          </a>
        </div>
      </div>
    </section>
  );
}
