import { getLiveStreams, getStreamByChannel } from "./streams.js";
import {
  extractDiscoverySignals,
  calculateRelevance,
  extractHashtags,
} from "../discovery/signals.js";

/**
 * Searches streams by text query (channel name, title, category, hashtag).
 * Only returns currently LIVE Kick broadcasts (no offline dummy data).
 */
export async function searchStreams(query, options = {}) {
  const { excludeChannelNames = [], limit = 20 } = options;
  const allStreams = await getLiveStreams(50);
  const q = (query || "").trim().toLowerCase();

  const excludeSet = new Set(excludeChannelNames.map((name) => name.toLowerCase()));

  // Direct channel query cleanup (e.g. "@username", "kick.com/username", "username")
  const cleanChannel = q
    .replace(/^https?:\/\/(www\.)?kick\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();

  // If user searched a specific creator handle, check if that specific channel is currently live
  let directLiveChannel = null;
  if (cleanChannel && !cleanChannel.startsWith("#") && !excludeSet.has(cleanChannel)) {
    directLiveChannel = await getStreamByChannel(cleanChannel);
  }

  // Combine live streams + direct channel (if live), avoiding duplicates
  const streamMap = new Map();
  for (const s of allStreams) {
    if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
      streamMap.set(s.channelName.toLowerCase(), s);
    }
  }
  if (directLiveChannel && directLiveChannel.isLive && !excludeSet.has(directLiveChannel.channelName.toLowerCase())) {
    streamMap.set(directLiveChannel.channelName.toLowerCase(), directLiveChannel);
  }

  const liveStreams = Array.from(streamMap.values());

  // If no search query, return all live streams sorted by viewer count
  if (!q) {
    return liveStreams
      .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
      .slice(0, limit);
  }

  const scored = liveStreams
    .map((stream) => {
      let score = 0;
      const titleLower = (stream.title || "").toLowerCase();
      const catLower = (stream.category || "").toLowerCase();
      const channelLower = (stream.channelName || "").toLowerCase();
      const hashtags = extractHashtags(stream.title);
      const tags = (stream.tags || []).map((t) => t.toLowerCase());

      // Exact or partial channel name match
      if (channelLower === q || (cleanChannel && channelLower === cleanChannel)) {
        score += 300;
      } else if (channelLower.includes(q) || (cleanChannel && channelLower.includes(cleanChannel))) {
        score += 150;
      }

      // Hashtag match (exact match or partial hashtag match)
      if (hashtags.includes(q) || hashtags.some((h) => h.includes(q))) {
        score += 200;
      }

      // Category match
      if (catLower === q || catLower.includes(q) || q.includes(catLower)) {
        score += 120;
      }

      // Title match
      if (titleLower.includes(q)) {
        score += 80;
      }

      // Tag match
      if (tags.some((t) => t.includes(q))) {
        score += 40;
      }

      return { stream, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // 1. Higher score first
      if (b.score !== a.score) return b.score - a.score;
      // 2. Higher viewer count
      return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
    })
    .map((item) => item.stream);

  return scored.slice(0, limit);
}

/**
 * Discovers streams related to a given reference stream.
 * Prioritizes:
 * 1. Exact hashtag match (e.g. #yatraroleplay)
 * 2. Exact category match (e.g. Grand Theft Auto V)
 * 3. Title keywords match (e.g. GTA RP, RP, Police)
 * 4. Other live streams
 */
export async function getRelatedStreams(referenceStream, options = {}) {
  const { activeFilter = "", activeQuery = "", excludeChannelNames = [], limit = 20 } = options;
  if (!referenceStream) {
    return searchStreams(activeQuery, { excludeChannelNames, limit });
  }

  const allStreams = await getLiveStreams(50);
  const signals = extractDiscoverySignals(referenceStream);

  // Filter out the reference stream and any already selected channels
  const excludeSet = new Set([
    referenceStream.channelName.toLowerCase(),
    ...excludeChannelNames.map((name) => name.toLowerCase()),
  ]);

  const candidateStreams = allStreams.filter(
    (s) => s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())
  );

  // Score candidates
  const scored = candidateStreams.map((stream) => {
    let score = calculateRelevance(stream, signals, activeQuery);

    // If an active filter chip is applied (hashtag or category)
    if (activeFilter) {
      const filterLower = activeFilter.trim().toLowerCase();
      const streamHashtags = extractHashtags(stream.title);
      const streamCatLower = (stream.category || "").toLowerCase();
      const streamTitleLower = (stream.title || "").toLowerCase();

      if (filterLower.startsWith("#")) {
        if (streamHashtags.includes(filterLower)) {
          score += 500;
        } else if (streamTitleLower.includes(filterLower)) {
          score += 300;
        } else {
          score -= 100;
        }
      } else {
        // Category or keyword chip
        if (streamCatLower === filterLower || streamCatLower.includes(filterLower)) {
          score += 400;
        } else if (streamTitleLower.includes(filterLower)) {
          score += 200;
        } else {
          score -= 50;
        }
      }
    }

    return { stream, score };
  });

  // Sort by score, then viewer count
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
  });

  // If activeFilter returned matches, return them
  const positive = scored.filter((item) => item.score > 0).map((item) => item.stream);
  if (positive.length > 0) {
    return positive.slice(0, limit);
  }

  // Fallback: Return top live streams if no specific keyword match was found
  return candidateStreams
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
