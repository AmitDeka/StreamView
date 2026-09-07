import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";

export function HomeCTA() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="relative rounded-3xl bg-gradient-to-b from-surface-card to-surface-elevated border border-border/80 p-8 sm:p-14 overflow-hidden shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 blur-[90px] rounded-full pointer-events-none"></div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to watch more?
        </h2>
        <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto mb-8">
          Launch Multi View now to discover live streams, assemble your grid, and immerse yourself in real-time gaming streams.
        </p>

        <Link
          href="/multi-view"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold bg-brand-gradient text-white shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <LayoutGrid className="w-5 h-5" />
          <span>Start Multi View</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
