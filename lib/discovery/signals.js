const HASHTAG_REGEX = /#[\p{L}\p{N}_]+/gu;

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
  "by", "from", "up", "about", "into", "over", "after", "is", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "new", "live", "stream", "playing", "day", "episode", "ep", "part", "pt"
]);

export function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(HASHTAG_REGEX);
  if (!matches) return [];
  const unique = Array.from(new Set(matches.map(tag => tag.toLowerCase())));
  return unique;
}

export const HASHTAG_COMMUNITIES = {};

export function getChannelsForHashtag(tag) {
  return [];
}

export function extractKeywords(title, category) {
  const words = [];
  
  if (title) {
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

  const chips = [];
  
  for (const tag of hashtags) {
    chips.push({
      type: "hashtag",
      value: tag,
      label: tag,
      icon: "Hash",
    });
  }

  const streamTitleLower = (stream.title || "").toLowerCase();
  const isYatra = streamTitleLower.includes("yatra") || tags.some((t) => t.includes("yatra"));
  const hasYatraHashtag = hashtags.some((h) => h.toLowerCase().includes("yatra"));

  if (isYatra && !hasYatraHashtag) {
    chips.unshift({
      type: "hashtag",
      value: "#yatraroleplay",
      label: "#yatraroleplay",
      icon: "Hash",
    });
  }

  if (category) {
    chips.push({
      type: "category",
      value: category,
      label: category,
      icon: "Gamepad2",
    });
  }

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

export function calculateRelevance(stream, signals, activeQuery = "") {
  let score = 0;
  const streamTitleLower = (stream.title || "").toLowerCase();
  const streamCategoryLower = (stream.category || "").toLowerCase();
  const streamChannelLower = (stream.channelName || "").toLowerCase();
  const streamTagsLower = (stream.tags || []).map(t => t.toLowerCase());
  const streamHashtags = extractHashtags(stream.title);

  if (activeQuery && activeQuery.trim()) {
    const q = activeQuery.trim().toLowerCase();
    if (streamChannelLower.includes(q)) score += 120;
    if (streamHashtags.some(h => h.includes(q))) score += 110;
    if (streamTitleLower.includes(q)) score += 80;
    if (streamCategoryLower.includes(q)) score += 70;
    if (streamTagsLower.some(t => t.includes(q))) score += 50;
    return score;
  }

  for (const h of signals.hashtags) {
    if (streamHashtags.includes(h)) {
      score += 100;
    } else if (streamTitleLower.includes(h)) {
      score += 90;
    }
  }

  if (signals.category && streamCategoryLower === signals.category.toLowerCase()) {
    score += 60;
  } else if (signals.category && (
    streamCategoryLower.includes(signals.category.toLowerCase()) ||
    signals.category.toLowerCase().includes(streamCategoryLower)
  )) {
    score += 45;
  }

  for (const kw of signals.keywords) {
    if (streamTitleLower.includes(kw)) {
      score += 25;
    }
  }

  for (const tag of signals.tags) {
    if (streamTagsLower.includes(tag)) {
      score += 30;
    }
  }

  score += Math.min(10, (stream.viewerCount || 0) / 1000);

  return score;
}
