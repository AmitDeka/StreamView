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
 * Queried concurrently to ensure smaller or un-tagged broadcasts are always found.
 */
export const KNOWN_YATRA_CHANNELS = [
  "hathoda",
  "chhabrasaab",
  "thunderboltgaming",
  "kryzor9",
  "shreeplayz",
  "candidgaming",
  "marcyxd",
  "fluffy-gaming",
  "ssplayzz",
  "nikita_playzz",
];

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
 * Requires genuine Yatra affiliation in stream title or broadcaster tags.
 */
export function isYatraStream(stream) {
  if (!stream || !stream.isLive) return false;

  const title = (stream.stream_title || stream.title || "").toLowerCase();
  const category = (stream.category?.name || stream.category || "").toLowerCase();
  const tags = Array.isArray(stream.tags) ? stream.tags.map((t) => String(t).toLowerCase()) : [];

  // 1. Must explicitly mention 'yatra' in title or streamer tags
  const hasYatraTitle = title.includes("yatra");
  const hasYatraTag = tags.some((t) => t.includes("yatra"));

  if (!hasYatraTitle && !hasYatraTag) {
    return false;
  }

  // 2. Must be GTA / RP related to filter out any false positives
  const isRoleplay =
    title.includes("rp") ||
    title.includes("roleplay") ||
    category.includes("grand theft auto") ||
    category.includes("gta") ||
    hasYatraTag;

  return isRoleplay;
}

/**
 * Dedicated fetcher for Yatra Roleplay broadcasts.
 * Queries Grand Theft Auto V subcategory feeds, Hindi regional feeds, and known creators in parallel,
 * then filters strictly through isYatraStream so only actual Yatra streamers are returned.
 */
export async function fetchYatraStreams(limit = 20, excludeChannelNames = [], specificQuery = "") {
  const excludeSet = new Set(
    (excludeChannelNames || []).map((name) => String(name).toLowerCase())
  );

  const queryLower = (specificQuery || "").trim().toLowerCase();

  // Concurrently fetch GTA V category (category_id=8), Hindi language streams, and known Yatra channels
  const [gtaStreams, hiStreams, ...knownStreams] = await Promise.all([
    fetchSubcategoryStreams("grand-theft-auto-v", 60),
    fetchLanguageStreams("hi", 40),
    ...KNOWN_YATRA_CHANNELS.map((channel) => getStreamByChannel(channel, false)),
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

  // If specificQuery starts with '#' (e.g. #YATRAROLEPLAY, #YATRARP):
  // 1. If streams have the exact hashtag in title or tags, return strictly those (e.g. #YATRAROLEPLAY -> chhabrasaab, kryzor9, shreeplayz)
  // 2. Otherwise if streams match the tag name without spaces (e.g. #YATRARP -> hathoda, candidgaming, ssplayzz), return those
  // 3. Fallback to all Yatra streams if no exact matches found
  if (queryLower.startsWith("#")) {
    const tag = queryLower.slice(1);

    // Exact hashtag match in title or tags
    const exactHashtags = yatraList.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const tags = (s.tags || []).map((t) => String(t).toLowerCase());
      return title.includes(queryLower) || tags.includes(queryLower);
    });
    if (exactHashtags.length > 0) {
      return exactHashtags
        .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
        .slice(0, limit);
    }

    // Keyword match without spaces (e.g. 'yatrarp' matches 'yatra rp' or 'yatrarp')
    const keywordMatches = yatraList.filter((s) => {
      const title = (s.title || "").toLowerCase().replace(/\s+/g, "");
      const tags = (s.tags || []).map((t) => String(t).toLowerCase().replace(/\s+/g, ""));
      return title.includes(tag) || tags.some((t) => t.includes(tag));
    });
    if (keywordMatches.length > 0) {
      return keywordMatches
        .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
        .slice(0, limit);
    }
  }

  // Default: return all active Yatra streams sorted by viewer count descending
  return yatraList
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
