import { getLiveStreams, getStreamByChannel } from "./streams";
import { extractDiscoverySignals, calculateRelevance, extractHashtags } from "../discovery/signals";

/**
 * Searches streams by text query (channel name, title, category, hashtag).
 */
export async function searchStreams(query, options = {}) {
  const { excludeChannelNames = [], limit = 20 } = options;
  const allStreams = await getLiveStreams(50);
  const q = (query || "").trim().toLowerCase();

  const excludeSet = new Set(excludeChannelNames.map(name => name.toLowerCase()));

  if (!q) {
    return allStreams
      .filter(s => !excludeSet.has(s.channelName.toLowerCase()))
      .slice(0, limit);
  }

  const scored = allStreams
    .filter(s => !excludeSet.has(s.channelName.toLowerCase()))
    .map(stream => {
      let score = 0;
      const titleLower = stream.title.toLowerCase();
      const catLower = stream.category.toLowerCase();
      const channelLower = stream.channelName.toLowerCase();
      const hashtags = extractHashtags(stream.title);
      const tags = (stream.tags || []).map(t => t.toLowerCase());

      if (channelLower === q) score += 200;
      else if (channelLower.includes(q)) score += 100;

      if (hashtags.includes(q) || hashtags.some(h => h.includes(q))) score += 120;
      if (titleLower.includes(q)) score += 80;
      if (catLower.includes(q)) score += 60;
      if (tags.some(t => t.includes(q))) score += 40;

      return { stream, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.stream);

  // If user searched for a specific channel name directly (or pasted @handle / kick.com/channel), query Kick directly
  const cleanChannel = q
    .replace(/^https?:\/\/(www\.)?kick\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();

  if (cleanChannel && !excludeSet.has(cleanChannel) && !scored.some(s => s.channelName.toLowerCase() === cleanChannel)) {
    try {
      const directChannel = await getStreamByChannel(cleanChannel);
      if (directChannel && directChannel.channelName.toLowerCase() === cleanChannel) {
        scored.unshift(directChannel);
      }
    } catch (e) {}
  }

  return scored.slice(0, limit);
}

/**
 * Discovers streams related to a given reference stream.
 * Prioritizes:
 * 1. Exact hashtag match
 * 2. Exact category match
 * 3. Relevant title keyword match
 * 4. Relevant official tag match
 * 5. Other live results
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
    ...excludeChannelNames.map(name => name.toLowerCase()),
  ]);

  const candidateStreams = allStreams.filter(s => !excludeSet.has(s.channelName.toLowerCase()));

  // Score candidates
  const scored = candidateStreams.map(stream => {
    let score = calculateRelevance(stream, signals, activeQuery);

    // If an active contextual chip filter is clicked (e.g. hashtag or category)
    if (activeFilter) {
      const filterLower = activeFilter.trim().toLowerCase();
      const streamHashtags = extractHashtags(stream.title);
      const streamCatLower = stream.category.toLowerCase();
      const streamTitleLower = stream.title.toLowerCase();

      if (filterLower.startsWith("#")) {
        if (streamHashtags.includes(filterLower)) {
          score += 500;
        } else if (streamTitleLower.includes(filterLower)) {
          score += 300;
        } else {
          // If filter is specific hashtag and stream doesn't have it, penalize
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

  // Sort by score descending, then by viewer count
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
  });

  return scored
    .filter(item => item.score > 0)
    .map(item => item.stream)
    .slice(0, limit);
}
