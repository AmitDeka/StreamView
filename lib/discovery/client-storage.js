"use client";

const STORAGE_KEY = "streamview_discovered_yatra_creators";

/**
 * Returns list of custom discovered Yatra creators from localStorage.
 */
export function getSavedYatraChannels() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists newly discovered Yatra creator to localStorage so they never get lost across serverless cold starts.
 */
export function saveYatraChannel(channelName) {
  if (typeof window === "undefined" || !channelName) return;
  try {
    const clean = String(channelName).trim().toLowerCase().replace(/^@/, "");
    if (!clean) return;
    const current = getSavedYatraChannels();
    if (!current.includes(clean)) {
      const updated = [clean, ...current].slice(0, 50); // keep up to 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore storage errors
  }
}

/**
 * Helper to get comma-separated list of known channels for API query.
 */
export function getKnownYatraParam() {
  const saved = getSavedYatraChannels();
  return saved.length > 0 ? saved.join(",") : "";
}
