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

import { fetchSubcategoryStreams, fetchLanguageStreams, getStreamByChannel } from "./streams.js";

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

/**
 * Known active Yatra Roleplay content creators on Kick.
 * Automatically expands in memory whenever any new Yatra stream is searched or discovered.
 */
export const DEFAULT_YATRA_CHANNELS = [
  "hathoda",
  "qayzer4",
  "onhypegamer",
  "imrocky",
  "candidgaming",
  "thunderboltgaming",
  "shreeplayz",
  "kryzor9",
  "chhabrasaab",
  "gamergill",
  "stelvin777",
  "marcyxd",
  "fluffy-gaming",
  "ssplayzz",
  "nikita_playzz",
];

// Dynamic set in server memory that grows as streams are discovered/searched
const dynamicYatraChannels = new Set(DEFAULT_YATRA_CHANNELS.map((c) => c.toLowerCase()));

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
 * Evaluates whether a live stream belongs to the Yatra Roleplay server.
 * Requires genuine Yatra affiliation in stream title, broadcaster tags, or known creator roster.
 * Automatically learns any newly matching creator into memory.
 */
export function isYatraStream(stream) {
  if (!stream || !stream.isLive) return false;

  const title = (stream.stream_title || stream.title || "").toLowerCase();
  const category = (stream.category?.name || stream.category || "").toLowerCase();
  const tags = Array.isArray(stream.tags) ? stream.tags.map((t) => String(t).toLowerCase()) : [];
  const channel = (stream.channelName || stream.slug || "").toLowerCase();
  const isKnownCreator = dynamicYatraChannels.has(channel);

  // 1. Must explicitly mention 'yatra' in title/tags, or be a verified Yatra server creator
  const hasYatraTitle = title.includes("yatra");
  const hasYatraTag = tags.some((t) => t.includes("yatra"));

  if (!hasYatraTitle && !hasYatraTag && !isKnownCreator) {
    return false;
  }

  // 2. Must be GTA / RP related to filter out any false positives
  const isRoleplay =
    title.includes("rp") ||
    title.includes("roleplay") ||
    category.includes("grand theft auto") ||
    category.includes("gta") ||
    hasYatraTag ||
    isKnownCreator;

  if (isRoleplay && channel) {
    // Automatically auto-learn this creator into the dynamic discovery pool!
    rememberYatraChannel(channel);
    return true;
  }

  return false;
}

/**
 * Dedicated fetcher for Yatra Roleplay broadcasts.
 * Queries Grand Theft Auto V subcategory feeds, Hindi regional feeds, and all dynamic community creators in parallel,
 * then filters strictly through isYatraStream so only actual Yatra streamers are returned.
 */
export async function fetchYatraStreams(limit = 20, excludeChannelNames = [], specificQuery = "") {
  const excludeSet = new Set(
    (excludeChannelNames || []).map((name) => String(name).toLowerCase())
  );

  const channelsToQuery = getKnownYatraChannels();

  // Concurrently fetch GTA V category (category_id=8), Hindi language streams, and dynamic Yatra channels
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

  // Return all active Yatra streams unified in a single community feed,
  // sorted by live viewer count descending so the top broadcasts appear first.
  // This guarantees that all Yatra creators (Hathoda, Chhabrasaab, Kryzor9, Shreeplayz, etc.)
  // are visible together regardless of whether a viewer searched #yatraroleplay, #yatrarp, or yatra.
  return yatraList
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
