// Unicode-aware regex for hashtag extraction
const HASHTAG_REGEX = /#[\p{L}\p{N}_]+/gu;

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
  "by", "from", "up", "about", "into", "over", "after", "is", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "new", "live", "stream", "playing", "day", "episode", "ep", "part", "pt"
]);

/**
 * Extracts hashtags from any text string.
 */
export function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];
  // Return unique lowercase hashtags
  const unique = Array.from(new Set(matches.map(tag => tag.toLowerCase())));
  return unique;
}

/**
 * Extracts meaningful keyword tokens from stream title and category.
 */
export function extractKeywords(title, category) {
  const words = [];
  
  if (title) {
    // Remove hashtags from title before extracting words
    const cleanTitle = title.replace(HASHTAG_REGEX, " ");
    const tokens = cleanTitle.split(/[\s\-_|,.:;!?()[\]{}<>\/\\~`"'&+=*^%$#@]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
    words.push(...tokens);
  }
  
  if (category) {
    const catTokens = category.split(/[\s\-_|,.:;!?()[\]{}<>\/\\~`"'&+=*^%$#@]+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
    words.push(...catTokens);
  }

  return Array.from(new Set(words));
}

/**
 * Extracts all discovery signals from a stream object.
 * Returns { hashtags, category, keywords, tags, suggestedChips }
 */
export function extractDiscoverySignals(stream) {
  if (!stream) {
    return {
      hashtags: [],
      category: "",
      keywords: [],
      tags: [],
      suggestedChips: [],
    };
  }

  const hashtags = extractHashtags(stream.title);
  const category = stream.category || "";
  const keywords = extractKeywords(stream.title, category);
  const tags = (stream.tags || []).map(t => t.toLowerCase());

  // Generate interactive discovery chips (prioritizing hashtags and category)
  const chips = [];
  
  // 1. Hashtags (keep original hashtag formatting)
  for (const tag of hashtags) {
    chips.push({
      type: "hashtag",
      value: tag,
      label: tag,
      icon: "Hash",
    });
  }

  // 2. Category
  if (category) {
    chips.push({
      type: "category",
      value: category,
      label: category,
      icon: "Gamepad2",
    });
  }

  // 3. Significant RP/Gameplay keywords (e.g., "rp", "police", "hindi", "gta")
  for (const kw of keywords) {
    if (["rp", "roleplay", "police", "custom", "hindi", "ranked", "pro"].includes(kw)) {
      chips.push({
        type: "keyword",
        value: kw,
        label: kw.toUpperCase(),
        icon: "Tag",
      });
    }
  }

  return {
    hashtags,
    category,
    keywords,
    tags,
    suggestedChips: chips,
  };
}

/**
 * Computes a relevance score between a target stream and reference discovery signals.
 * Higher score means higher relevance.
 */
export function calculateRelevance(stream, signals, activeQuery = "") {
  let score = 0;
  const streamTitleLower = (stream.title || "").toLowerCase();
  const streamCategoryLower = (stream.category || "").toLowerCase();
  const streamChannelLower = (stream.channelName || "").toLowerCase();
  const streamTagsLower = (stream.tags || []).map(t => t.toLowerCase());
  const streamHashtags = extractHashtags(stream.title);

  // If user typed an explicit active search query
  if (activeQuery && activeQuery.trim()) {
    const q = activeQuery.trim().toLowerCase();
    if (streamChannelLower.includes(q)) score += 120;
    if (streamHashtags.some(h => h.includes(q))) score += 110;
    if (streamTitleLower.includes(q)) score += 80;
    if (streamCategoryLower.includes(q)) score += 70;
    if (streamTagsLower.some(t => t.includes(q))) score += 50;
    return score;
  }

  // 1. Exact hashtag match (Highest priority)
  for (const h of signals.hashtags) {
    if (streamHashtags.includes(h)) {
      score += 100;
    } else if (streamTitleLower.includes(h)) {
      score += 90;
    }
  }

  // 2. Category match
  if (signals.category && streamCategoryLower === signals.category.toLowerCase()) {
    score += 60;
  } else if (signals.category && (
    streamCategoryLower.includes(signals.category.toLowerCase()) ||
    signals.category.toLowerCase().includes(streamCategoryLower)
  )) {
    score += 45;
  }

  // 3. Relevant title keywords match
  for (const kw of signals.keywords) {
    if (streamTitleLower.includes(kw)) {
      score += 25;
    }
  }

  // 4. Relevant official tag match
  for (const tag of signals.tags) {
    if (streamTagsLower.includes(tag)) {
      score += 30;
    }
  }

  // 5. Baseline score based on viewer count to break ties
  score += Math.min(10, (stream.viewerCount || 0) / 1000);

  return score;
}
