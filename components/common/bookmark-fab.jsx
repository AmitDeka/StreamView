"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { BookmarkModal } from "./bookmark-modal";

export function BookmarkFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40 pointer-events-auto print:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Bookmark this page"
          title="Bookmark this page (Ctrl+D)"
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-surface-card/95 hover:bg-surface-elevated text-brand-gold border border-brand-gold/40 hover:border-brand-gold shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.6),0_0_25px_rgba(234,179,8,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <Bookmark className="w-4 h-4 fill-brand-gold/25 text-brand-gold group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
            </span>
          </div>
          <span className="text-xs font-semibold text-text-primary group-hover:text-brand-gold transition-colors pr-0.5">
            Bookmark
          </span>
        </button>
      </div>

      <BookmarkModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
