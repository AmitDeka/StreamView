import Link from "next/link";
import { ArrowLeft, FileText, AlertCircle, ShieldAlert, CheckCircle2, ExternalLink } from "lucide-react";
import { APP_NAME, APP_DISCLAIMER } from "@/lib/config";

export const metadata = {
  title: `Terms of Service - ${APP_NAME}`,
  description: `Terms of Service and legal disclaimer for using ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12 border-b border-border/60 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-brand-orange/30 text-brand-orange text-xs font-semibold mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Last updated: September 2026. By accessing or using {APP_NAME}, you acknowledge and agree to these terms.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Important Disclaimer Notice */}
        <div className="p-5 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 text-text-primary space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Independent Third-Party Disclaimer</span>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            {APP_DISCLAIMER} {APP_NAME} is an independent web application designed to enhance multi-stream viewing through Kick&apos;s publicly available embedding technology.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <CheckCircle2 className="w-5 h-5 text-brand-gold" />
            <h2>1. Permitted Use</h2>
          </div>
          <p>
            {APP_NAME} is provided free of charge for personal, non-commercial entertainment purposes. You may use this service to watch multiple live streams simultaneously, discover related broadcasts, and adjust layout arrangements.
          </p>
          <p>
            You agree not to use the application to engage in automated scraping, abuse API endpoints, or conduct any activity that disrupts stream delivery for other users.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <ExternalLink className="w-5 h-5 text-brand-orange" />
            <h2>2. Official Kick Embed Player Compliance</h2>
          </div>
          <p>
            All video broadcasts rendered within {APP_NAME} utilize Kick&apos;s official iframe player (<code className="px-1.5 py-0.5 rounded bg-surface-elevated text-brand-gold text-xs">player.kick.com</code>).
          </p>
          <p>
            {APP_NAME} does not re-broadcast, capture, proxy, or alter the underlying video bitstream in any way. Stream viewing is subject to{" "}
            <a
              href="https://kick.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline font-medium"
            >
              Kick&apos;s Terms of Service
            </a>
            .
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <ShieldAlert className="w-5 h-5 text-brand-pink" />
            <h2>3. Intellectual Property</h2>
          </div>
          <p>
            All streamer trademarks, usernames, channel avatars, game titles, and stream content displayed on {APP_NAME} are the property of their respective creators, publishers, and Kick.
          </p>
          <p>
            The {APP_NAME} brand, application source code, interface designs, and recommendation algorithms are owned by the project author and released under open-source terms on GitHub.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <h2 className="text-base font-bold text-text-primary">4. Disclaimer of Warranties</h2>
          <p>
            {APP_NAME} is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee uninterrupted stream availability, playback performance, or zero downtime, as video streaming depends on Kick&apos;s infrastructure and your network connection.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <h2 className="text-base font-bold text-text-primary">5. Open Source Project & Contact</h2>
          <p>
            Questions or feedback regarding these terms or the project can be submitted via issues or discussions on the official GitHub repository:
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/AmitDeka/StreamView"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface-hover text-brand-gold border border-border hover:border-brand-gold/40 transition-colors"
            >
              <span>GitHub Repository: AmitDeka/StreamView</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
