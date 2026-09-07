import Link from "next/link";
import { APP_NAME, APP_DISCLAIMER } from "@/lib/config";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background-secondary/90 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-primary tracking-wide">
            {APP_NAME}
          </span>
          <p className="text-xs text-text-muted max-w-xl">
            {APP_DISCLAIMER}
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-text-secondary">
          <Link href="/multi-view" className="hover:text-brand-gold transition-colors">
            Multi View
          </Link>
          <span className="text-border">•</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors">
            Terms
          </span>
          <span className="text-border">•</span>
          <span className="hover:text-text-primary cursor-pointer transition-colors">
            Privacy
          </span>
        </div>
      </div>
    </footer>
  );
}
