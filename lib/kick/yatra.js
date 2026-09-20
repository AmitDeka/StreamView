import {
  fetchSubcategoryStreams,
  fetchLanguageStreams,
  getStreamByChannel,
} from "./streams.js";

import yatraStreamers from "@/data/yatra-streamers.json";

export const DEFAULT_YATRA_CHANNELS = yatraStreamers;

const MAX_DYNAMIC_YATRA_CHANNELS = DEFAULT_YATRA_CHANNELS.length + 60;

const dynamicYatraChannels = new Set(
  DEFAULT_YATRA_CHANNELS.map((c) => c.toLowerCase()),
);

export function rememberYatraChannel(channelName) {
  if (!channelName) return;
  const clean = String(channelName).trim().toLowerCase().replace(/^@/, "");
  if (
    clean &&
    /^[a-zA-Z0-9_-]{1,50}$/.test(clean) &&
    !dynamicYatraChannels.has(clean) &&
    dynamicYatraChannels.size < MAX_DYNAMIC_YATRA_CHANNELS
  ) {
    dynamicYatraChannels.add(clean);
  }
}

export function getKnownYatraChannels() {
  return Array.from(dynamicYatraChannels);
}

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

  if (otherKnownServers.some((srv) => title.includes(srv) || tags.some((t) => t.includes(srv)))) {
    return true;
  }

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

  for (const tag of tags) {
    const hashMatch = tag.match(/^#?([a-z0-9_]+?)(?:rp|roleplay)$/i);
    if (hashMatch) {
      const serverPrefix = hashMatch[1].toLowerCase();
      if (!genericPrefixes.has(serverPrefix) && !serverPrefix.startsWith("yatra")) {
        return true;
      }
    }
  }

  const titleRpMatches = title.matchAll(/\b([a-z0-9_]+)\s+(?:rp|roleplay)\b/gi);
  for (const match of titleRpMatches) {
    const serverPrefix = match[1].toLowerCase();
    if (!genericPrefixes.has(serverPrefix) && !serverPrefix.startsWith("yatra")) {
      return true;
    }
  }

  return false;
}

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

  const isOtherServer = isDifferentRpServer(title, tags);

  if (isOtherServer && !hasYatraTitle && !hasYatraTag) {
    return false;
  }

  if (hasYatraTitle || hasYatraTag) {
    if (channel) rememberYatraChannel(channel);
    return true;
  }

  const isKnownYatra = dynamicYatraChannels.has(channel);
  const isGtaCategory =
    category.includes("grand theft auto") || category.includes("gta");
  const hasRpKeywords =
    title.includes("rp") ||
    title.includes("roleplay") ||
    tags.some((t) => t.includes("rp") || t.includes("roleplay"));

  if (isKnownYatra && (isGtaCategory || hasRpKeywords) && !isOtherServer) {
    return true;
  }

  return false;
}

export async function fetchYatraStreams(
  limit = 20,
  excludeChannelNames = [],
) {
  const excludeSet = new Set(
    (excludeChannelNames || []).map((name) => String(name).toLowerCase()),
  );

  const channelsToQuery = getKnownYatraChannels();

  const [gtaStreams, hiStreams, enStreams, ...knownStreams] = await Promise.all([
    fetchSubcategoryStreams("grand-theft-auto-v", 100),
    fetchLanguageStreams("hi", 100),
    fetchLanguageStreams("en", 100),
    ...channelsToQuery.map((channel) => getStreamByChannel(channel, false)),
  ]);

  const streamMap = new Map();
  for (const s of [...gtaStreams, ...hiStreams, ...enStreams, ...knownStreams]) {
    if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
      if (isYatraStream(s)) {
        streamMap.set(s.channelName.toLowerCase(), s);
      }
    }
  }

  const yatraList = Array.from(streamMap.values());

  return yatraList
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, Math.max(limit, 40));
}
