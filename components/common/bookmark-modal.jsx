"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Copy,
  Check,
  X,
  Smartphone,
  Sparkles,
} from "lucide-react";

export function BookmarkModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState("windows"); // "windows", "mac", "mobile"
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
      const ua = window.navigator.userAgent || "";
      if (/Android|iPhone|iPad|iPod/i.test(ua)) {
        setOs("mobile");
      } else if (/Mac/i.test(ua)) {
        setOs("mac");
      } else {
        setOs("windows");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      const urlToCopy = currentUrl || (typeof window !== "undefined" ? window.location.href : "");
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn("Failed to copy link", err);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div className="relative w-full max-w-md bg-surface-card border border-border/90 rounded-2xl p-6 shadow-2xl animate-scaleUp overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold via-brand-orange to-brand-red"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold shadow-glow-sm">
            <Bookmark className="w-5 h-5 fill-brand-gold/20" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Bookmark StreamView
            </h3>
            <p className="text-xs text-text-muted">
              Save this page for quick 1-click access anytime
            </p>
          </div>
        </div>

        {/* Shortcut Instruction Box */}
        <div className="my-5 p-4 rounded-xl bg-surface-elevated border border-border/80 text-center">
          {os === "mobile" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-surface-card border border-border flex items-center justify-center text-text-secondary">
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Tap your browser menu (<span className="font-semibold text-white">⋮</span> or{" "}
                <span className="font-semibold text-white">Share</span>) and select{" "}
                <span className="font-semibold text-brand-gold">
                  &quot;Add to Bookmarks&quot;
                </span>{" "}
                or{" "}
                <span className="font-semibold text-brand-gold">
                  &quot;Add to Home screen&quot;
                </span>
                .
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                {os === "mac" ? (
                  <>
                    <kbd className="px-2.5 py-1 text-xs font-bold text-text-primary bg-surface-card border border-border rounded-lg shadow-sm">
                      ⌘ Cmd
                    </kbd>
                    <span className="text-text-muted font-bold">+</span>
                    <kbd className="px-2.5 py-1 text-xs font-bold text-text-primary bg-surface-card border border-border rounded-lg shadow-sm">
                      D
                    </kbd>
                  </>
                ) : (
                  <>
                    <kbd className="px-2.5 py-1 text-xs font-bold text-text-primary bg-surface-card border border-border rounded-lg shadow-sm">
                      Ctrl
                    </kbd>
                    <span className="text-text-muted font-bold">+</span>
                    <kbd className="px-2.5 py-1 text-xs font-bold text-text-primary bg-surface-card border border-border rounded-lg shadow-sm">
                      D
                    </kbd>
                  </>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Press the shortcut above on your keyboard to instantly add this page to your bookmarks bar.
              </p>
            </div>
          )}
        </div>

        {/* 1-Click Copy URL Box */}
        <div className="space-y-2 mb-4">
          <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
            Or Copy Link
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-elevated border border-border">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-text-secondary outline-none truncate font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-brand-gold text-black hover:bg-brand-orange hover:text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Auto-Save Helper Tip */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-[11px] text-text-secondary mb-5">
          <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
          <span>
            <strong className="text-brand-gold font-semibold">Auto-Save:</strong> StreamView remembers your active streams and layout automatically. When you open your bookmark later, your layout will load right up!
          </span>
        </div>

        {/* Bottom Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-xs font-semibold bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border/80 transition-colors"
        >
          Got it, Close
        </button>
      </div>
    </div>
  );
}
