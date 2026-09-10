/**
 * DEDICATED SECTION: Yatra Roleplay Engine
 * Dedicated to handling all variations of the Yatra Roleplay community:
 * #YATRAROLEPLAY, #YATRARP, #YatraRoleplay, #yatraroleplay, #YatraRP, #yatrarp,
 * as well as non-hashtag queries ("yatraroleplay", "yatrarp", "yatra roleplay", "yatra rp").
 *
 * This dedicated module ensures that:
 * 1. Streamers actively streaming Yatra Roleplay are discovered immediately.
 * 2. Unrelated generic GTA V, English, or non-Yatra RP streams NEVER leak into Yatra results.
 */

import { fetchSubcategoryStreams, fetchLanguageStreams } from "./streams.js";

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
 * Queries Grand Theft Auto V subcategory feeds and Hindi regional feeds in parallel,
 * then filters strictly through isYatraStream so only actual Yatra streamers are returned.
 */
export async function fetchYatraStreams(limit = 20, excludeChannelNames = []) {
  const excludeSet = new Set(
    (excludeChannelNames || []).map((name) => String(name).toLowerCase())
  );

  // Concurrently fetch GTA V category (category_id=8) and Hindi language streams
  const [gtaStreams, hiStreams] = await Promise.all([
    fetchSubcategoryStreams("grand-theft-auto-v", 60),
    fetchLanguageStreams("hi", 40),
  ]);

  const streamMap = new Map();
  for (const s of [...gtaStreams, ...hiStreams]) {
    if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
      if (isYatraStream(s)) {
        streamMap.set(s.channelName.toLowerCase(), s);
      }
    }
  }

  const yatraList = Array.from(streamMap.values());

  // Sort by active viewer count descending
  return yatraList
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
