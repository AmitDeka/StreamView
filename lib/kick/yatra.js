/**
 * DEDICATED SECTION: Yatra Roleplay Engine
 * Dedicated to handling all variations of the Yatra Roleplay community:
 * #YATRAROLEPLAY, #YATRARP, #YatraRoleplay, #yatraroleplay, #YatraRP, #yatrarp,
 * as well as text queries ("yatraroleplay", "yatrarp", "yatra roleplay", "yatra rp").
 *
 * This dedicated module ensures that:
 * 1. Streamers actively streaming Yatra Roleplay are discovered immediately.
 * 2. Unrelated generic GTA V, English, or non-Yatra RP streams NEVER leak into Yatra results.
 */

import {
  fetchSubcategoryStreams,
  fetchLanguageStreams,
  getStreamByChannel,
} from "./streams.js";

/**
 * All recognized Yatra Roleplay tag and query variations.
 */
export const YATRA_TAG_VARIATIONS = [
  "#YATRAROLEPLAY",
  "#YATRARP",
  "#YatraRoleplay",
  "#yatraroleplay",
  "#YatraRP",
  "#yatrarp",
  "yatraroleplay",
  "yatrarp",
  "yatra roleplay",
  "yatra rp",
  "yatra",
];

import yatraStreamers from "@/data/yatra-streamers.json";

/**
 * Known active Yatra Roleplay content creators on Kick.
 * Loaded from data/yatra-streamers.json (which is auto-updated via GitHub Actions cron).
 */
export const DEFAULT_YATRA_CHANNELS = yatraStreamers;

// Dynamic set in server memory that grows as streams are discovered/searched
const dynamicYatraChannels = new Set(
  DEFAULT_YATRA_CHANNELS.map((c) => c.toLowerCase()),
);

/**
 * Dynamically registers a newly discovered Yatra creator into the community pool.
 */
export function rememberYatraChannel(channelName) {
  if (!channelName) return;
  const clean = String(channelName).trim().toLowerCase().replace(/^@/, "");
  if (clean && !dynamicYatraChannels.has(clean)) {
    dynamicYatraChannels.add(clean);
  }
}

export function getKnownYatraChannels() {
  return Array.from(dynamicYatraChannels);
}

// Backward-compatible alias
export const KNOWN_YATRA_CHANNELS = DEFAULT_YATRA_CHANNELS;

/**
 * Determines whether a query or filter string is targeting Yatra Roleplay.
 * Case-insensitive, handles with/without '#' prefix, and matches:
 * - #YATRAROLEPLAY, #YATRARP, #YatraRoleplay, #yatraroleplay, #YatraRP, #yatrarp
 * - yatraroleplay, yatrarp, yatra rp, yatra roleplay, yatra
 */
export function isYatraQuery(query) {
  if (!query) return false;
  const clean = String(query).trim().toLowerCase().replace(/^#/, "");
  return (
    clean === "yatraroleplay" ||
    clean === "yatrarp" ||
    clean === "yatra" ||
    clean === "yatra rp" ||
    clean === "yatra roleplay" ||
    clean.startsWith("yatra")
  );
}

/**
 * Detects if a stream is explicitly advertising a DIFFERENT RP server (e.g. "SoulCity RP", "XYZ RP", "#xyzrp", "Echo RP").
 * Uses both a known list of competing servers AND dynamic regex detection for any unlisted server pattern.
 */
function isDifferentRpServer(title, tags) {
  const otherKnownServers = [
    "soulcity",
    "lifeinsoulcity",
    "soul city",
    "subharambh",
    "gloryrp",
    "glory rp",
    "legacyrp",
    "legacy rp",
    "echorp",
    "echo rp",
    "nexus",
    "nexusrp",
    "svrp",
    "hydrarp",
    "hydra rp",
    "delhirp",
    "mumbairp",
    "nopixel",
    "rivals",
    "grandrp",
    "cityliferp",
  ];

  // 1. Direct match on known competing servers
  if (otherKnownServers.some((srv) => title.includes(srv) || tags.some((t) => t.includes(srv)))) {
    return true;
  }

  // 2. Dynamic server detection: match "[ServerName] RP" or "[ServerName] Roleplay" (e.g. "XYZ RP", "ABC Roleplay")
  const genericPrefixes = new Set([
    "yatra",
    "gta",
    "v",
    "gtav",
    "gta5",
    "fivem",
    "five m",
    "indian",
    "india",
    "hindi",
    "best",
    "new",
    "live",
    "my",
    "the",
  ]);

  // Check hashtags like #xyzrp or #xyzroleplay
  for (const tag of tags) {
    const hashMatch = tag.match(/^#?([a-z0-9_]+?)(?:rp|roleplay)$/i);
    if (hashMatch) {
      const serverPrefix = hashMatch[1].toLowerCase();
      if (!genericPrefixes.has(serverPrefix)) {
        return true; // Mentions another server like #xyzrp
      }
    }
  }

  // Check title pattern for words preceding RP or Roleplay (e.g. "XYZ RP", "XYZ Roleplay")
  const titleRpMatches = title.matchAll(/\b([a-z0-9_]+)\s+(?:rp|roleplay)\b/gi);
  for (const match of titleRpMatches) {
    const serverPrefix = match[1].toLowerCase();
    if (!genericPrefixes.has(serverPrefix)) {
      return true; // Mentions another server like "XYZ RP"
    }
  }

  return false;
}

/**
 * Evaluates whether a live stream belongs to the Yatra Roleplay server.
 * Requires genuine Yatra affiliation in stream title, broadcaster tags, or known creator roster.
 * Automatically learns any newly matching creator into memory.
 */
export function isYatraStream(stream) {
  if (!stream || !stream.isLive) return false;

  const title = (stream.stream_title || stream.title || "").toLowerCase();
  const category = (
    stream.category?.name ||
    stream.category ||
    ""
  ).toLowerCase();
  const tags = Array.isArray(stream.tags)
    ? stream.tags.map((t) => String(t).toLowerCase())
    : [];
  const channel = (stream.channelName || stream.slug || "").toLowerCase();

  const hasYatraTitle = title.includes("yatra");
  const hasYatraTag = tags.some((t) => t.includes("yatra"));

  // Check if streamer is explicitly playing on a DIFFERENT GTA RP server
  const isOtherServer = isDifferentRpServer(title, tags);

  // If the stream explicitly mentions another RP server and does not mention Yatra, it is NOT Yatra RP!
  if (isOtherServer && !hasYatraTitle && !hasYatraTag) {
    return false;
  }

  // 1. Explicitly has 'yatra' in title or tags
  if (hasYatraTitle || hasYatraTag) {
    if (channel) rememberYatraChannel(channel);
    return true;
  }

  // 2. Known Yatra creators: must be streaming GTA roleplay specifically (not generic games or generic GTA Online)
  const isKnownYatra = dynamicYatraChannels.has(channel);
  const isGtaCategory =
    category.includes("grand theft auto") || category.includes("gta");
  const hasRpKeywords =
    title.includes("rp") ||
    title.includes("roleplay") ||
    tags.some((t) => t.includes("rp") || t.includes("roleplay"));

  if (isKnownYatra && isGtaCategory && hasRpKeywords && !isOtherServer) {
    return true;
  }

  return false;
}

/**
 * Dedicated fetcher for Yatra Roleplay broadcasts.
 * Queries Grand Theft Auto V subcategory feeds, Hindi regional feeds, and all dynamic community creators in parallel,
 * then filters strictly through isYatraStream so ONLY actively LIVE Yatra streamers are returned.
 */
export async function fetchYatraStreams(
  limit = 20,
  excludeChannelNames = [],
  specificQuery = "",
) {
  const excludeSet = new Set(
    (excludeChannelNames || []).map((name) => String(name).toLowerCase()),
  );

  const channelsToQuery = getKnownYatraChannels();

  // Concurrently fetch GTA V category (category_id=8), Hindi language streams, and dynamic Yatra channels (LIVE only)
  const [gtaStreams, hiStreams, ...knownStreams] = await Promise.all([
    fetchSubcategoryStreams("grand-theft-auto-v", 100),
    fetchLanguageStreams("hi", 100),
    ...channelsToQuery.map((channel) => getStreamByChannel(channel, false)),
  ]);

  const streamMap = new Map();
  for (const s of [...gtaStreams, ...hiStreams, ...knownStreams]) {
    if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
      if (isYatraStream(s)) {
        streamMap.set(s.channelName.toLowerCase(), s);
      }
    }
  }

  const yatraList = Array.from(streamMap.values());

  // Return strictly LIVE Yatra streams sorted by live viewer count descending
  return yatraList
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
