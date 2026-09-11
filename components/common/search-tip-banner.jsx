"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";

export function SearchTipBanner({ className = "", onExampleClick }) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("streamview_dismiss_search_tip");
      if (!dismissed) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("streamview_dismiss_search_tip", "true");
    } catch {
      // ignore
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className={`relative flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/30 text-left transition-all ${className}`}
    >
      <Lightbulb className="w-4 h-4 text-brand-gold shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 min-w-0 pr-5">
        <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed">
          <strong className="text-brand-gold font-semibold">Discovery Tip:</strong> Due to Kick API limitations on hashtags, smaller streams may not always appear under <code className="text-brand-gold bg-black/40 px-1 py-0.5 rounded font-mono text-[10px] sm:text-[11px]">#tags</code>. If you can&apos;t find a stream, <strong className="text-text-primary">search directly by their Kick username</strong> (e.g.{" "}
          <button
            type="button"
            onClick={() => onExampleClick && onExampleClick("hathoda")}
            className="text-brand-gold hover:underline font-medium cursor-pointer"
          >
            hathoda
          </button>
          ,{" "}
          <button
            type="button"
            onClick={() => onExampleClick && onExampleClick("exion")}
            className="text-brand-gold hover:underline font-medium cursor-pointer"
          >
            exion
          </button>
          ) to load them immediately.
        </p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        title="Dismiss tip"
        className="absolute top-2 right-2 p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-surface-elevated transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
