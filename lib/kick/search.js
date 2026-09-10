import {
  getLiveStreams,
  getStreamByChannel,
  CATEGORY_SLUGS,
  LANGUAGE_CODES,
  fetchSubcategoryStreams,
  fetchLanguageStreams,
} from "./streams.js";
import {
  extractDiscoverySignals,
  calculateRelevance,
  extractHashtags,
} from "../discovery/signals.js";

/**
 * Searches streams by text query (channel name, title, category, language, hashtag).
 * Dynamically queries Kick category and language feeds so chips like Valorant, Hindi, English return real live streams.
 * Only returns currently LIVE Kick broadcasts (no offline dummy data).
 */
export async function searchStreams(query, options = {}) {
  const { excludeChannelNames = [], limit = 20 } = options;
  const q = (query || "").trim().toLowerCase();
  const excludeSet = new Set(excludeChannelNames.map((name) => name.toLowerCase()));

  // Direct channel query cleanup (e.g. "@username", "kick.com/username", "username")
  const cleanChannel = q
    .replace(/^https?:\/\/(www\.)?kick\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .trim();

  const bareQ = q.replace(/^#/, "").trim();

  // Detect if query is a language (e.g. "hindi", "english", "spanish", "#hindi")
  const isLanguageTarget = q in LANGUAGE_CODES || bareQ in LANGUAGE_CODES;
  const langCode = isLanguageTarget ? (LANGUAGE_CODES[q] || LANGUAGE_CODES[bareQ]) : null;

  // Detect if query matches a known game or subcategory (e.g. "valorant", "#valorant", "gta v", "just chatting")
  const isCategoryTarget = q in CATEGORY_SLUGS || bareQ in CATEGORY_SLUGS;
  const categorySlug = isCategoryTarget
    ? (CATEGORY_SLUGS[q] || CATEGORY_SLUGS[bareQ])
    : (bareQ.length > 2 ? bareQ.replace(/[^a-z0-9]+/g, "-") : null);

  // Parallel fetch: general stream pool + targeted subcategory / language streams
  const fetchTasks = [
    getLiveStreams(50),
  ];

  if (langCode) {
    fetchTasks.push(fetchLanguageStreams(langCode, 30));
  }

  if (categorySlug) {
    fetchTasks.push(fetchSubcategoryStreams(categorySlug, 30));
  }

  // If search involves GTA, roleplay, or yatra, fetch GTA V subcategory
  if (q.includes("gta") || q.includes("yatra") || q.includes("rp") || q.includes("roleplay")) {
    fetchTasks.push(fetchSubcategoryStreams("grand-theft-auto-v", 30));
  }

  // If cleanChannel looks like a streamer username, check if that specific channel is live
  let directLiveChannel = null;
  if (cleanChannel && !cleanChannel.startsWith("#") && !excludeSet.has(cleanChannel) && !isLanguageTarget && !isCategoryTarget) {
    directLiveChannel = await getStreamByChannel(cleanChannel);
  }

  const results = await Promise.allSettled(fetchTasks);

  // Combine live streams + direct channel (if live), avoiding duplicates
  const streamMap = new Map();
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      for (const s of r.value) {
        if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
          streamMap.set(s.channelName.toLowerCase(), s);
        }
      }
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
      const langLower = (stream.language || "").toLowerCase();
      const hashtags = extractHashtags(stream.title);
      const tags = (stream.tags || []).map((t) => t.toLowerCase());

      // Language match (e.g. searching "Hindi", "English")
      const titleHasHindi = titleLower.includes("hindi") || titleLower.includes("bgmi") || tags.some(t => t.includes("hindi") || t.includes("india"));
      if (q === "hindi") {
        if (titleHasHindi) {
          score += 550;
        } else if (langLower === "hi" || langLower === "hindi" || langLower.includes("india")) {
          score += 350;
        }
      } else if (q === "english") {
        if (langLower === "en" || langLower === "english" || langLower.includes("english")) {
          score += 350;
        }
      } else if (langLower === q) {
        score += 300;
      } else if (langLower.includes(q)) {
        score += 150;
      }

      // Exact or partial channel name match
      if (channelLower === q || (cleanChannel && channelLower === cleanChannel)) {
        score += 400;
      } else if (channelLower.includes(q) || (cleanChannel && channelLower.includes(cleanChannel))) {
        score += 180;
      }

      // Hashtag match (exact match or partial hashtag match, with or without #)
      const bareQ = q.replace(/^#/, "");
      if (
        hashtags.includes(q) ||
        hashtags.some((h) => h.includes(q) || h.includes(bareQ)) ||
        (q.startsWith("#") && titleLower.includes(bareQ))
      ) {
        score += 300;
      }

      // Category match (including GTA, CS2, Call of Duty aliases)
      const isGtaQuery = q.includes("gta") || q.includes("grand theft auto");
      const isGtaCat = catLower.includes("grand theft auto") || catLower.includes("gta");

      const isCsQuery = q.includes("cs2") || q.includes("counter strike") || q.includes("counter-strike");
      const isCsCat = catLower.includes("counter-strike") || catLower.includes("cs2");

      const isCodQuery = q.includes("cod") || q.includes("call of duty") || q.includes("warzone");
      const isCodCat = catLower.includes("call of duty") || catLower.includes("warzone");

      if (
        catLower === q ||
        catLower.includes(q) ||
        q.includes(catLower) ||
        (isGtaQuery && isGtaCat) ||
        (isCsQuery && isCsCat) ||
        (isCodQuery && isCodCat)
      ) {
        score += 250;
      }

      // Title match
      if (titleLower.includes(q) || (isGtaQuery && (titleLower.includes("gta") || titleLower.includes("grand theft")))) {
        score += 100;
      }

      // Tag match
      if (tags.some((t) => t.includes(q) || t.includes(bareQ))) {
        score += 50;
      }

      return { stream, score };
    });

  const positive = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // 1. Higher score first
      if (b.score !== a.score) return b.score - a.score;
      // 2. Higher viewer count
      return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
    })
    .map((item) => item.stream);

  if (positive.length > 0) {
    return positive.slice(0, limit);
  }

  // Fallback for roleplay / yatra: if no streamer currently has the exact #yatraroleplay tag in title,
  // return live GTA V / Roleplay streams so users still get active GTA RP streams!
  if (q.includes("yatra") || q.includes("rp") || q.includes("roleplay")) {
    const gtaFallback = liveStreams
      .filter(
        (s) =>
          (s.category || "").toLowerCase().includes("grand theft auto") ||
          (s.title || "").toLowerCase().includes("rp") ||
          (s.title || "").toLowerCase().includes("gta")
      )
      .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));
    if (gtaFallback.length > 0) {
      return gtaFallback.slice(0, limit);
    }
  }

  // If a specific search query has 0 matches, return [] (do NOT return random unrelated global streams)
  return [];
}

/**
 * Discovers streams related to a given reference stream.
 * Prioritizes:
 * 1. Exact hashtag match (e.g. #yatraroleplay)
 * 2. Exact category match (e.g. Grand Theft Auto V, Valorant)
 * 3. Language match (e.g. Hindi, English)
 * 4. Title keywords match (e.g. GTA RP, RP, Police)
 */
export async function getRelatedStreams(referenceStream, options = {}) {
  const { activeFilter = "", activeQuery = "", excludeChannelNames = [], limit = 20 } = options;
  if (!referenceStream) {
    return searchStreams(activeQuery || activeFilter, { excludeChannelNames, limit });
  }

  const filterLower = (activeFilter || "").trim().toLowerCase();
  const refCatLower = (referenceStream.category || "").trim().toLowerCase();
  const refLangLower = (referenceStream.language || "").trim().toLowerCase();

  // Reference stream language resolution
  const refLangCode = LANGUAGE_CODES[refLangLower] || (refLangLower.length === 2 ? refLangLower : null);

  // Target category to fetch (from active filter or reference stream)
  const targetCategory =
    CATEGORY_SLUGS[filterLower] ||
    CATEGORY_SLUGS[refCatLower] ||
    (filterLower.includes("gta") || filterLower.includes("yatra") || filterLower.includes("rp") ? "grand-theft-auto-v" : null) ||
    (!filterLower.startsWith("#") && filterLower.length > 2 ? filterLower : null) ||
    (refCatLower ? refCatLower : null);

  // Target language to fetch
  const targetLang = LANGUAGE_CODES[filterLower] || refLangCode || null;

  const fetchTasks = [
    getLiveStreams(50),
  ];

  if (targetCategory) {
    fetchTasks.push(fetchSubcategoryStreams(targetCategory, 30));
  }
  if (targetLang) {
    fetchTasks.push(fetchLanguageStreams(targetLang, 30));
  }
  // If reference stream has a language distinct from targetLang, fetch that as well
  if (refLangCode && refLangCode !== targetLang) {
    fetchTasks.push(fetchLanguageStreams(refLangCode, 30));
  }

  const results = await Promise.allSettled(fetchTasks);

  const streamMap = new Map();
  for (const r of results) {
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      for (const s of r.value) {
        if (s && s.isLive) {
          streamMap.set(s.channelName.toLowerCase(), s);
        }
      }
    }
  }

  const allStreams = Array.from(streamMap.values());
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

    const streamHashtags = extractHashtags(stream.title);
    const streamCatLower = (stream.category || "").toLowerCase();
    const streamTitleLower = (stream.title || "").toLowerCase();
    const streamLangLower = (stream.language || "").toLowerCase();

    // Bonus for matching reference stream language in "All Related"
    if (!filterLower) {
      if (
        (refLangLower === "hi" || refLangLower === "hindi") &&
        (streamLangLower === "hi" || streamLangLower === "hindi" || streamTitleLower.includes("hindi") || streamTitleLower.includes("india"))
      ) {
        score += 300;
      } else if (refLangLower && streamLangLower === refLangLower) {
        score += 150;
      }
    }

    if (filterLower) {
      // Explicit Language filter (e.g. "Hindi", "English")
      if (
        (filterLower === "hindi" && (streamLangLower === "hi" || streamLangLower === "hindi" || streamTitleLower.includes("hindi") || streamTitleLower.includes("india"))) ||
        (filterLower === "english" && (streamLangLower === "en" || streamLangLower === "english")) ||
        streamLangLower === filterLower
      ) {
        score += 500;
      } else if (filterLower === "hindi" || filterLower === "english") {
        score -= 200;
      }

      if (filterLower.startsWith("#")) {
        // Explicit hashtag filter (e.g. "#yatraroleplay", "#deshkastreamer")
        if (streamHashtags.includes(filterLower)) {
          score += 600;
        } else if (streamTitleLower.includes(filterLower)) {
          score += 400;
        } else {
          // Does NOT match the hashtag filter: disqualify from hashtag results!
          score = -100;
        }
      } else {
        // Category or keyword chip
        if (streamCatLower === filterLower || streamCatLower.includes(filterLower) || filterLower.includes(streamCatLower)) {
          score += 400;
        } else if (streamTitleLower.includes(filterLower)) {
          score += 200;
        } else {
          score -= 100;
        }
      }
    }

    return { stream, score };
  });

  // When an explicit filter (hashtag, category, language) is active:
  // ONLY return streams that ACTUALLY match the filter (score > 0).
  // If no streams match, return [] so user is accurately told 0 streams found,
  // rather than showing unrelated foreign streams pretending to be matches!
  if (filterLower) {
    const matches = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
      })
      .map((item) => item.stream);
    return matches.slice(0, limit);
  }

  // When "All Related" (no filter active), sort by relevance score, then viewers
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.stream.viewerCount || 0) - (a.stream.viewerCount || 0);
  });

  const positive = scored.filter((item) => item.score > 0).map((item) => item.stream);
  if (positive.length > 0) {
    return positive.slice(0, limit);
  }

  // Fallback: Return top live streams if no specific keyword match was found
  return candidateStreams
    .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
    .slice(0, limit);
}
