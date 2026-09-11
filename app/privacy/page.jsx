import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Globe, EyeOff, Lock } from "lucide-react";
import { APP_NAME } from "@/lib/config";

export const metadata = {
  title: `Privacy Policy - ${APP_NAME}`,
  description: `Learn how ${APP_NAME} protects your privacy and handles user data.`,
};

export default function PrivacyPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-brand-gold/30 text-brand-gold text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy & Security</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Last updated: September 2026. This policy explains how {APP_NAME} approaches user privacy, local storage, and third-party embeds.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed text-text-secondary">
        {/* Section 1 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <EyeOff className="w-5 h-5 text-brand-gold" />
            <h2>1. Zero Personal Data Collection</h2>
          </div>
          <p>
            {APP_NAME} does not require you to create an account, register, or provide any personal information (such as your name, email address, password, or payment details) to use the service.
          </p>
          <p>
            We do not maintain user profile databases, nor do we sell, rent, or trade any personal information to third parties.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <Database className="w-5 h-5 text-brand-orange" />
            <h2>2. Local Storage Usage</h2>
          </div>
          <p>
            To provide a smooth multi-stream viewing experience, {APP_NAME} saves your current configuration in your browser&apos;s local storage (<code className="px-1.5 py-0.5 rounded bg-surface-elevated text-brand-gold text-xs">localStorage</code>). This includes:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-text-muted">
            <li>The channels you have selected to watch together</li>
            <li>Your preferred layout mode (Stage View or Equal Grid)</li>
          </ul>
          <p>
            This data is stored purely within your own browser on your device and is never uploaded to our servers. You can clear this data at any time by clicking &quot;Reset Grid&quot; or clearing your browser cookies and site data.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <Globe className="w-5 h-5 text-brand-pink" />
            <h2>3. Third-Party Embeds (Kick Video Player)</h2>
          </div>
          <p>
            {APP_NAME} uses Kick&apos;s official iframe embed player (<code className="px-1.5 py-0.5 rounded bg-surface-elevated text-brand-gold text-xs">player.kick.com</code>) to display live video broadcasts.
          </p>
          <p>
            When an embedded video player loads, your browser establishes a direct connection with Kick&apos;s servers. Kick may process your IP address, browser telemetry, or set functional cookies required for video streaming in accordance with{" "}
            <a
              href="https://kick.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline font-medium"
            >
              Kick&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <div className="flex items-center gap-2.5 text-base font-bold text-text-primary">
            <Lock className="w-5 h-5 text-live" />
            <h2>4. Cookies & Analytics</h2>
          </div>
          <p>
            {APP_NAME} does not use invasive tracking beacons or advertising networks. We may utilize standard aggregated analytics (such as Google Analytics 4) strictly to measure website performance, multi-view usage trends, and page responsiveness. All analytics data is processed anonymously without linking to individual personal identities.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface-card border border-border/70">
          <h2 className="text-base font-bold text-text-primary">5. Open Source & Transparency</h2>
          <p>
            {APP_NAME} is an open-source project. You can inspect our complete source code, review our API integration methods, or report security concerns on our official GitHub repository:
          </p>
          <div className="pt-2">
            <a
              href="https://github.com/AmitDeka/StreamView"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface-hover text-brand-gold border border-border hover:border-brand-gold/40 transition-colors"
            >
              <span>View Source on GitHub</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
