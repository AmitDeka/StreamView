import { Sparkles, LayoutGrid, MonitorPlay, Zap } from "lucide-react";

const FEATURES_LIST = [
  {
    icon: Sparkles,
    title: "Contextual Stream Discovery",
    description:
      "Our smart discovery engine identifies hashtags (#yatraroleplay, etc.), game categories, and title keywords from your active stream to recommend connected live streamers immediately.",
    accent: "brand-gold",
  },
  {
    icon: LayoutGrid,
    title: "Stage View & Equal Grid",
    description:
      "Choose between Stage View with instant Swap to feature any stream on the main stage, or balanced Equal Grid (50/50, 33%, 2x2, up to 6 streams). Fully responsive on monitors and mobile.",
    accent: "brand-orange",
  },
  {
    icon: MonitorPlay,
    title: "Official Kick Embed Players",
    description:
      "Streams play directly inside Kick's official embeddable player. No video proxying, no stream tampering, and no video lag—just clean, synchronized multiple stream viewing.",
    accent: "brand-pink",
  },
];

export function HomeFeatures() {
  return (
    <section className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold mb-1.5 sm:mb-2">
          Engineered for Gaming & Roleplay
        </h2>
        <p className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-white px-2">
          Everything you need to watch multi-angle action
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {FEATURES_LIST.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="group relative p-4 sm:p-6 rounded-2xl bg-surface-card border border-border/80 hover:border-brand-gold/60 transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-elevated border border-border group-hover:border-brand-gold/60 flex items-center justify-center text-brand-gold mb-3 sm:mb-4 transition-colors">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 group-hover:text-brand-gold transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {feat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
