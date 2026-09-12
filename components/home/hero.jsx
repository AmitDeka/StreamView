import Link from "next/link";
import { ArrowRight, LayoutGrid, Sparkles, Radio, Heart } from "lucide-react";
import { APP_TAGLINE } from "@/lib/config";

export function HomeHero() {
  return (
    <section className="relative pt-10 pb-8 sm:pt-20 sm:pb-16 text-center px-3 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-orange/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* Dedicated to Yatra RP Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-[11px] sm:text-xs font-bold text-brand-gold mb-6 sm:mb-8 shadow-glow-sm">
          <Heart className="w-3.5 h-3.5 fill-brand-gold text-brand-gold animate-pulse" />
          <span>Dedicated to the Yatra RP Community</span>
          <span className="text-brand-gold/40 hidden xs:inline">•</span>
          <span className="text-text-secondary font-normal hidden xs:inline">Multi View</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white mb-4 sm:mb-6 leading-[1.15]">
          Watch Multiple Streams <br className="hidden sm:inline" />
          <span className="text-gradient">Together</span>
        </h1>

        {/* Subtitle with Yatra RP dedication */}
        <p className="text-sm sm:text-lg text-text-secondary max-w-2xl mb-8 sm:mb-10 leading-relaxed px-2">
          This website is proudly dedicated to the <strong className="text-brand-gold font-semibold">Yatra RP community</strong>. Discover connected live Kick streams and build your custom Multi View to watch every roleplay storyline and gaming event from multiple angles simultaneously.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/multi-view"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-bold bg-brand-gradient text-white shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Start Multi View</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-semibold bg-surface-elevated text-text-primary border border-border/80 hover:border-brand-gold/50 hover:bg-surface-hover transition-colors"
          >
            <span>See How It Works</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
