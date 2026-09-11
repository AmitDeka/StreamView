"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { LayoutGrid, Github } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isMultiView = pathname === "/multi-view";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-surface-card to-surface-elevated border border-border group-hover:border-brand-gold/60 transition-colors shadow-glow-sm shrink-0">
            <div className="grid grid-cols-2 gap-0.5 sm:gap-1 p-0.5 sm:p-1">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm bg-brand-gold"></span>
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm bg-brand-orange"></span>
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm bg-brand-red"></span>
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm bg-brand-pink"></span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-brand-gold transition-colors leading-tight">
              {APP_NAME}
            </span>
            <span className="text-[9px] sm:text-[10px] font-medium tracking-wider uppercase text-text-muted">
              Multi View
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/"
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pathname === "/"
                ? "text-brand-gold bg-surface-elevated border border-border/70"
                : "text-text-secondary hover:text-white hover:bg-surface-hover/50"
            }`}
          >
            Home
          </Link>
          <Link
            href="/multi-view"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              isMultiView
                ? "bg-brand-gradient text-white shadow-glow-sm"
                : "bg-surface-elevated text-text-primary border border-border hover:border-brand-gold/50 hover:text-brand-gold"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Multi View</span>
          </Link>

          <a
            href="https://github.com/AmitDeka/StreamView"
            target="_blank"
            rel="noopener noreferrer"
            title="View StreamView on GitHub"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white bg-surface-elevated/70 hover:bg-surface-elevated border border-border/70 hover:border-border transition-all"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
