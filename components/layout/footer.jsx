import Link from "next/link";
import { APP_NAME, APP_DISCLAIMER } from "@/lib/config";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background-secondary/90 pt-8 pb-16 sm:py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-primary tracking-wide">
            {APP_NAME}
          </span>
          <p className="text-xs text-text-muted max-w-xl">
            Dedicated with ❤️ to the Yatra RP community. {APP_DISCLAIMER}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs text-text-secondary flex-wrap justify-center sm:justify-end">
          <Link href="/how-it-works" className="hover:text-brand-gold transition-colors">
            How It Works
          </Link>
          <span className="text-border">•</span>
          <Link href="/multi-view" className="hover:text-brand-gold transition-colors">
            Multi View
          </Link>
          <span className="text-border">•</span>
          <Link href="/terms" className="hover:text-brand-gold transition-colors">
            Terms
          </Link>
          <span className="text-border">•</span>
          <Link href="/privacy" className="hover:text-brand-gold transition-colors">
            Privacy
          </Link>
          <span className="text-border">•</span>
          <a
            href="https://github.com/AmitDeka/StreamView"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
