export const APP_NAME = "StreamView";
export const APP_TAGLINE = "Watch Multiple Streams Together";
export const APP_DESCRIPTION = "Discover related live Kick streams and watch them simultaneously in a customizable Multi View interface.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://stream-view-beige.vercel.app";
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export const APP_DISCLAIMER = `${APP_NAME} is an independent third-party application and is not affiliated with or endorsed by Kick.`;

export const SUPPORTED_LAYOUTS = [1, 2, 3, 4, 6];
export const DEFAULT_LAYOUT = 4;
export const MAX_STREAMS = 6;

export const LAYOUT_CONFIGS = {
  1: { id: 1, label: "Single", gridClass: "grid-cols-1", maxStreams: 1, icon: "Square" },
  2: { id: 2, label: "2 Streams", gridClass: "grid-cols-1 md:grid-cols-2", maxStreams: 2, icon: "Columns2" },
  3: { id: 3, label: "3 Streams", gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", maxStreams: 3, icon: "Grid3X3" },
  4: { id: 4, label: "4 Streams", gridClass: "grid-cols-1 md:grid-cols-2", maxStreams: 4, icon: "Grid2X2" },
  6: { id: 6, label: "6 Streams", gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", maxStreams: 6, icon: "LayoutGrid" },
};

export const TRENDING_TAGS = [
  "#yatraroleplay",
  "GTA V",
  "GTA RP",
  "Just Chatting",
  "Counter-Strike 2",
  "Valorant",
  "Call of Duty",
  "Hindi",
  "English",
];

export const KICK_PLAYER_BASE_URL = "https://player.kick.com";
export const KICK_CHANNEL_BASE_URL = "https://kick.com";
