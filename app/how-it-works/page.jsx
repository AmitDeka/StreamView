import Link from "next/link";
import {
  Sparkles,
  Server,
  Search,
  Bot,
  ShieldCheck,
  Zap,
  Radio,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Heart,
  LayoutGrid,
  Filter,
  Eye,
  Database,
  Cpu,
} from "lucide-react";
import { APP_NAME, APP_URL } from "@/lib/config";

export const metadata = {
  title: "How It Works · Backend Discovery Engine & Architecture | StreamView",
  description:
    "Explore how StreamView's dual discovery engine, automated crawler, and official Kick embed architecture power real-time multi-view streaming for the Yatra Roleplay community.",
  alternates: {
    canonical: `${APP_URL}/how-it-works`,
  },
  openGraph: {
    title: "How StreamView Works · Backend Architecture & Stream Discovery",
    description:
      "A technical walkthrough of how StreamView automatically discovers live Yatra Roleplay creators on Kick (even with 1 viewer), filters external servers, and powers multi-stream viewing.",
    url: `${APP_URL}/how-it-works`,
    siteName: APP_NAME,
    type: "article",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-text-primary">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/40 text-[11px] sm:text-xs font-bold text-brand-gold mb-4 sm:mb-6 shadow-glow-sm">
          <Heart className="w-3.5 h-3.5 fill-brand-gold text-brand-gold animate-pulse" />
          <span>Architecture &amp; Discovery Engine · Dedicated to Yatra RP</span>
        </div>

        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
          How Our <span className="text-gradient">Backend &amp; Discovery</span> Engine Works
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl mx-auto">
          A transparent look into the engineering behind StreamView: solving platform API limitations, automating creator discovery on Kick, guaranteeing zero false positives, and delivering synchronized multi-view playback.
        </p>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {/* Section 1: The Core Challenge */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-border/80 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                1. The Discovery Challenge: Platform API Limitations
              </h2>
              <span className="text-xs text-text-muted">Why standard directory search misses community creators</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
            Unlike traditional social platforms with full-text hashtag search, streaming directories categorize broadcasts strictly by game subcategory. This creates two distinct hurdles for community roleplay discovery:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-elevated border border-border/60">
              <h3 className="text-sm font-bold text-brand-gold mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                No Native Hashtag Search Endpoint
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Platform APIs do not provide a direct endpoint to query streams exclusively by hashtags like <code className="text-brand-gold bg-black/40 px-1 py-0.5 rounded font-mono text-[11px]">#yatraroleplay</code>. Instead, platforms only return broad category lists.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated border border-border/60">
              <h3 className="text-sm font-bold text-brand-orange mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                The &quot;Top 100&quot; Cutoff Barrier
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Global GTA V feeds only expose the top 100 broadcasts sorted by concurrent viewers. During peak gaming hours, community streamers with 1 to 50 viewers fall beneath this cutoff and remain invisible in standard global queries.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: The Dual Discovery Architecture */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-gold">
              The Dual Engine Solution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              2. How StreamView Discovers Every Creator
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              We developed a two-pillar discovery architecture that unites instant real-time search with an automated background crawler.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engine A */}
            <div className="p-6 rounded-2xl bg-surface-card border border-border/80 flex flex-col justify-between shadow-lg">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-[11px] font-bold text-brand-gold mb-4">
                  <Zap className="w-3.5 h-3.5" />
                  Engine A: Instant Real-Time Lookup
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Direct Channel Query &amp; Local Memory
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                  When a viewer searches a streamer by username (e.g. <code className="text-brand-gold font-mono">hathoda</code>, <code className="text-brand-gold font-mono">gunshot</code>, <code className="text-brand-gold font-mono">exion</code>):
                </p>
                <ul className="space-y-2.5 text-xs text-text-muted">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>0-Second Delay:</strong> The backend directly queries the creator&apos;s real-time broadcast status via official endpoints.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>Client-Side Persistence:</strong> Once discovered, the creator&apos;s handle is cached locally in the viewer&apos;s browser (<code className="text-brand-gold font-mono">localStorage</code>), ensuring they stay visible across serverless cold starts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>Slug Normalization:</strong> Handles hyphens and underscores interchangeably (e.g. <code className="text-text-primary font-mono">ft_aqua_is_live</code> and <code className="text-text-primary font-mono">ft-aqua-is-live</code>).</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 text-[11px] text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-gold" />
                <span>Response Time: <strong>~120ms</strong> · Zero rate-limiting</span>
              </div>
            </div>

            {/* Engine B */}
            <div className="p-6 rounded-2xl bg-surface-card border border-border/80 flex flex-col justify-between shadow-lg">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/15 border border-brand-orange/30 text-[11px] font-bold text-brand-orange mb-4">
                  <Bot className="w-3.5 h-3.5" />
                  Engine B: Automated GitHub Actions Crawler
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Continuous Background Indexing
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                  A scheduled background worker crawls streaming feeds looking specifically for active Yatra Roleplay broadcasts:
                </p>
                <ul className="space-y-2.5 text-xs text-text-muted">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>Ascending Viewer Feeds:</strong> Queries feeds sorted by lowest viewer count (<code className="text-brand-orange font-mono">sort=viewers_asc</code>) to find 1 to 5 viewer streams.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>Regional Language Crawling:</strong> Scans regional Hindi feeds where smaller broadcasts are not pushed off directory listings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-live shrink-0 mt-0.5" />
                    <span><strong>Automated Code Updates:</strong> New creators are merged into the repository roster (<code className="text-text-primary font-mono">data/yatra-streamers.json</code>), committed to Git, and automatically deployed worldwide via Vercel.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 text-[11px] text-text-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                <span>Runs daily at: <strong>6:30 PM, 7:30 PM, 9:30 PM &amp; 12:00 AM IST</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Smart Verification & Server Isolation */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-border/80 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                3. Smart Verification &amp; Server Isolation
              </h2>
              <span className="text-xs text-text-muted">Keeping the #yatraroleplay feed 100% authentic</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            A major challenge with community discovery is preventing broadcasts from unrelated games or external roleplay servers from polluting the feed. Our engine enforces three strict validation rules:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-elevated border border-border/60">
              <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-live animate-pulse"></span>
                Strict Live Status Only
              </h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Offline channels are strictly filtered out across all search and discovery views. Only streams actively transmitting live video are ever presented.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated border border-border/60">
              <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-brand-gold" />
                Dynamic Server Isolation
              </h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Our dynamic server detection parses broadcast titles and tags. If a creator is broadcasting on an external roleplay server, our engine automatically identifies the external server pattern and blocks them from appearing under #yatra.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated border border-border/60">
              <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-orange" />
                Roleplay Keyword Check
              </h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Known creators must be streaming roleplay specifically. Generic multiplayer sessions (e.g. stunt races, heists) without roleplay tags are never falsely tagged as Yatra RP.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Creator Guide */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-surface-card to-surface-elevated border border-brand-gold/30 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                4. Streamer Guide: How to Guarantee Instant Discovery
              </h2>
              <span className="text-xs text-text-muted">Best practices for Yatra Roleplay broadcasters</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            If you stream Yatra Roleplay on Kick, follow these 4 simple steps to ensure your stream appears automatically on StreamView:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-border/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-brand-gold font-mono">STEP 01</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">Tag Your Broadcast</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Include <code className="text-brand-gold font-mono">#yatraroleplay</code>, <code className="text-brand-gold font-mono">#yatrarp</code>, or <code className="text-brand-gold font-mono">Yatra RP</code> in your stream title or tags.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-border/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-brand-orange font-mono">STEP 02</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">Set Category to GTA V</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Ensure your stream category is set to <strong className="text-text-primary">Grand Theft Auto V</strong> on your Kick creator dashboard.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-border/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-brand-gold font-mono">STEP 03</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">Broadcast Language</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Set your broadcast language to <strong className="text-text-primary">Hindi</strong> or <strong className="text-text-primary">English</strong> so regional discovery crawlers index you immediately.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-border/70 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-live font-mono">STEP 04</span>
                <h3 className="text-sm font-bold text-white mt-1 mb-2">Search Once</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Search your Kick username once in StreamView to instantly register your handle into community memory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Official Players & Privacy */}
        <section className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-border/80 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-pink/20 border border-brand-pink/40 flex items-center justify-center text-brand-pink shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                5. Player Integrity, Performance &amp; Creator Revenue
              </h2>
              <span className="text-xs text-text-muted">Zero proxying, full official metric credit</span>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
            <p>
              StreamView uses official, authorized Kick embed players (<code className="text-brand-gold font-mono">player.kick.com</code>) to render all multi-view video tiles.
            </p>
            <ul className="space-y-2 text-xs text-text-muted pl-4 list-disc">
              <li><strong>Zero Video Restreaming:</strong> StreamView does not proxy, decode, or tamper with video bitrates. Video streams come directly from Kick&apos;s content delivery network.</li>
              <li><strong>100% Creator Credit:</strong> All live view counts, watch time hours, and creator ad impressions are credited directly to each streamer&apos;s official Kick account.</li>
              <li><strong>Privacy Preserving:</strong> StreamView does not track personal user identities, store passwords, or intercept account credentials. Preferences remain local to your device.</li>
            </ul>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-surface-elevated via-surface-card to-surface-elevated border border-brand-gold/40 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Experience Multi View in Action
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
            Ready to watch your favorite Yatra Roleplay creators simultaneously from multiple angles? Launch your custom multi-view workspace now.
          </p>
          <div className="pt-2">
            <Link
              href="/multi-view"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-brand-gradient shadow-glow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Launch Multi View</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
