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
import { isYatraQuery, isYatraStream, fetchYatraStreams, rememberYatraChannel } from "./yatra.js";

/**
 * Searches streams by text query (channel name, title, category, language, hashtag).
 * Dynamically queries Kick category and language feeds so chips like Valorant, Hindi, English return real live streams.
 * Only returns currently LIVE Kick broadcasts (no offline dummy data).
 */
export async function searchStreams(query, options = {}) {
  const { excludeChannelNames = [], limit = 20 } = options;
  const q = (query || "").trim().toLowerCase();
  const excludeSet = new Set(excludeChannelNames.map((name) => name.toLowerCase()));

  // DEDICATED SECTION: Yatra Roleplay
  // Dedicated to: #YATRAROLEPLAY, #YATRARP, #YatraRoleplay, #yatraroleplay, #YatraRP, #yatrarp
  if (isYatraQuery(q)) {
    return await fetchYatraStreams(limit, excludeChannelNames, q);
  }

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

  // Detect if query involves GTA V, roleplay servers, or community hashtags
  const isRpOrCommunityQuery =
    q.startsWith("#") ||
    q.includes("gta") ||
    q.includes("grand theft") ||
    q.includes("yatra") ||
    q.includes("roleplay") ||
    q.includes("rp") ||
    q.includes("soulcity") ||
    q.includes("lifeinsoulcity") ||
    q.includes("city") ||
    q.includes("fivem") ||
    q.includes("subharambh") ||
    q.includes("glory") ||
    q.includes("legacy") ||
    q.includes("echo");

  // Parallel fetch: general stream pool + targeted subcategory / language streams
  const fetchTasks = [
    getLiveStreams(50),
    fetchLanguageStreams("hi", 100),
    fetchLanguageStreams("en", 30),
  ];

  if (langCode && langCode !== "hi" && langCode !== "en") {
    fetchTasks.push(fetchLanguageStreams(langCode, 30));
  }

  if (categorySlug && categorySlug !== "grand-theft-auto-v") {
    fetchTasks.push(fetchSubcategoryStreams(categorySlug, 30));
  }

  // If search involves GTA V, roleplay, community servers, or any hashtag, fetch GTA V subcategory
  if (isRpOrCommunityQuery) {
    fetchTasks.push(fetchSubcategoryStreams("grand-theft-auto-v", 100));
  }

  // If query is for Yatra Roleplay (e.g. #yatraroleplay, #yatrarp, yatra), also query the live Yatra community pool
  if (bareQ.includes("yatra") || q.includes("yatra")) {
    fetchTasks.push(fetchYatraStreams(30, excludeChannelNames));
  }

  // If cleanChannel looks like a streamer username, fetch that specific channel (LIVE only)
  if (cleanChannel && !cleanChannel.startsWith("#") && !excludeSet.has(cleanChannel) && !isLanguageTarget && !isCategoryTarget) {
    fetchTasks.push(getStreamByChannel(cleanChannel, false));
    if (cleanChannel.includes("_")) {
      fetchTasks.push(getStreamByChannel(cleanChannel.replace(/_/g, "-"), false));
    }
  }

  const results = await Promise.allSettled(fetchTasks);

  // Combine live streams + direct channel (strictly LIVE only), avoiding duplicates
  const streamMap = new Map();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      if (Array.isArray(r.value)) {
        for (const s of r.value) {
          if (s && s.isLive && !excludeSet.has(s.channelName.toLowerCase())) {
            streamMap.set(s.channelName.toLowerCase(), s);
            if (isYatraStream(s)) {
              rememberYatraChannel(s.channelName);
            }
          }
        }
      } else if (typeof r.value === "object" && r.value.channelName && r.value.isLive && !excludeSet.has(r.value.channelName.toLowerCase())) {
        streamMap.set(r.value.channelName.toLowerCase(), r.value);
        if (isYatraStream(r.value)) {
          rememberYatraChannel(r.value.channelName);
        }
      }
    }
  }

  const liveStreams = Array.from(streamMap.values());

  // If no search query, return active community streams (LIVE Yatra first, then Indian GTA RP & Hindi, then global)
  if (!q) {
    try {
      const yatraCommunity = await fetchYatraStreams(10, excludeChannelNames);
      for (const y of yatraCommunity) {
        if (y && y.isLive && !streamMap.has(y.channelName.toLowerCase())) {
          streamMap.set(y.channelName.toLowerCase(), y);
        }
      }
    } catch (e) {
      // ignore
    }

    return Array.from(streamMap.values())
      .filter((s) => s && s.isLive)
      .sort((a, b) => {
        // 1. Live Yatra streams first
        const aIsYatra = isYatraStream(a);
        const bIsYatra = isYatraStream(b);
        if (aIsYatra && !bIsYatra) return -1;
        if (!aIsYatra && bIsYatra) return 1;

        // 2. Indian RP / Hindi streams preference
        const aIsIndian = a.language === "Hindi" || a.language === "hi" || (a.category || "").includes("Grand Theft Auto");
        const bIsIndian = b.language === "Hindi" || b.language === "hi" || (b.category || "").includes("Grand Theft Auto");
        if (aIsIndian && !bIsIndian) return -1;
        if (!aIsIndian && bIsIndian) return 1;

        return (b.viewerCount || 0) - (a.viewerCount || 0);
      })
      .slice(0, limit);
  }

  // If search query is an explicit hashtag (starts with '#'):
  // Strictly return ONLY streams that actually match this hashtag or tag topic!
  if (q.startsWith("#")) {
    const tag = q.slice(1).trim().toLowerCase();

    const hashtagMatches = liveStreams.filter((stream) => {
      const hashtags = extractHashtags(stream.title);
      const titleLower = (stream.title || "").toLowerCase();
      const tags = (stream.tags || []).map((t) => String(t).toLowerCase());

      // 1. Exact hashtag in stream hashtags or title (e.g. #deshkastreamer, #yatraroleplay)
      if (hashtags.includes(q) || titleLower.includes(q)) {
        return true;
      }

      // 2. Specific matching for Yatra Roleplay (#yatraroleplay, #yatrarp, #yatra):
      // Allows all streams with 'yatra' in title, tags, or verified active Yatra creators
      if (tag === "yatraroleplay" || tag.includes("yatra")) {
        return titleLower.includes("yatra") || tags.some((t) => t.includes("yatra")) || isYatraStream(stream);
      }

      // 3. Match compound hashtag text without '#' (e.g. #deshkastreamer matching 'deshkastreamer')
      if (tag.length > 2 && (titleLower.includes(tag) || tags.some((t) => t.includes(tag)))) {
        return true;
      }

      return false;
    });

    if (hashtagMatches.length > 0) {
      return hashtagMatches
        .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0))
        .slice(0, limit);
    }

    return [];
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

      // Exact or partial channel name match (normalizing dashes and underscores)
      const cleanSlug = cleanChannel ? cleanChannel.replace(/[-_ ]+/g, "") : "";
      const streamSlug = channelLower.replace(/[-_ ]+/g, "");
      if (channelLower === q || (cleanChannel && channelLower === cleanChannel) || (cleanSlug && streamSlug === cleanSlug)) {
        score += 600;
      } else if (channelLower.includes(q) || (cleanChannel && channelLower.includes(cleanChannel)) || (cleanSlug && streamSlug.includes(cleanSlug))) {
        score += 250;
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

      // Specific match for Yatra Roleplay queries (only rewards streams with 'yatra' in title/tags)
      if (bareQ.includes("yatra")) {
        if (titleLower.includes("yatra") || tags.some((t) => t.includes("yatra"))) {
          score += 450;
        }
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
    .filter((item) => item.score > 0 && item.stream && item.stream.isLive)
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

  // DEDICATED SECTION: Yatra Roleplay (#YATRAROLEPLAY, #YATRARP, #YatraRoleplay, #yatraroleplay, #YatraRP, #yatrarp)
  if (
    isYatraQuery(activeFilter) ||
    isYatraQuery(activeQuery) ||
    (!activeFilter && !activeQuery && isYatraStream(referenceStream))
  ) {
    return await fetchYatraStreams(
      limit,
      [referenceStream.channelName, ...excludeChannelNames],
      activeFilter || activeQuery || (isYatraStream(referenceStream) ? "#yatraroleplay" : "")
    );
  }

  const filterLower = (activeFilter || "").trim().toLowerCase();
  const refCatLower = (referenceStream.category || "").trim().toLowerCase();
  const refLangLower = (referenceStream.language || "").trim().toLowerCase();

  // Reference stream language resolution
  const refLangCode = LANGUAGE_CODES[refLangLower] || (refLangLower.length === 2 ? refLangLower : null);

  const isRpFilter =
    filterLower.startsWith("#") ||
    filterLower.includes("gta") ||
    filterLower.includes("grand theft") ||
    filterLower.includes("yatra") ||
    filterLower.includes("rp") ||
    filterLower.includes("soulcity") ||
    filterLower.includes("lifeinsoulcity") ||
    filterLower.includes("city") ||
    filterLower.includes("fivem") ||
    filterLower.includes("subharambh");

  const isRpRef =
    refCatLower.includes("grand theft auto") ||
    refCatLower.includes("gta") ||
    (referenceStream.title || "").toLowerCase().includes("rp") ||
    (referenceStream.title || "").toLowerCase().includes("soulcity");

  // Target category to fetch (from active filter or reference stream)
  const targetCategory =
    CATEGORY_SLUGS[filterLower] ||
    CATEGORY_SLUGS[refCatLower] ||
    (isRpFilter || isRpRef ? "grand-theft-auto-v" : null) ||
    (!filterLower.startsWith("#") && filterLower.length > 2 ? filterLower : null) ||
    (refCatLower ? refCatLower : null);

  // Target language to fetch
  const targetLang = LANGUAGE_CODES[filterLower] || refLangCode || null;

  const fetchTasks = [
    getLiveStreams(50),
    fetchLanguageStreams("hi", 100),
  ];

  if (targetCategory) {
    fetchTasks.push(fetchSubcategoryStreams(targetCategory, 100));
  }
  if (targetLang && targetLang !== "hi") {
    fetchTasks.push(fetchLanguageStreams(targetLang, 30));
  }
  // If reference stream has a language distinct from targetLang, fetch that as well
  if (refLangCode && refLangCode !== targetLang && refLangCode !== "hi") {
    fetchTasks.push(fetchLanguageStreams(refLangCode, 30));
  }

  const results = await Promise.allSettled(fetchTasks);

  const streamMap = new Map();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      if (Array.isArray(r.value)) {
        for (const s of r.value) {
          if (s && s.isLive) {
            streamMap.set(s.channelName.toLowerCase(), s);
          }
        }
      } else if (typeof r.value === "object" && r.value.channelName && r.value.isLive) {
        streamMap.set(r.value.channelName.toLowerCase(), r.value);
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

  // If active filter is an explicit hashtag (starts with '#'):
  // Strictly return ONLY streams that actually contain this #hashtag or its tag topic!
  if (filterLower.startsWith("#")) {
    const tag = filterLower.slice(1).trim().toLowerCase();

    const hashtagMatches = candidateStreams
      .filter((stream) => {
        const streamHashtags = extractHashtags(stream.title);
        const streamTitleLower = (stream.title || "").toLowerCase();
        const streamTags = (stream.tags || []).map((t) => String(t).toLowerCase());

        if (streamHashtags.includes(filterLower) || streamTitleLower.includes(filterLower)) {
          return true;
        }

        if (tag === "yatraroleplay" || tag.includes("yatra")) {
          return streamTitleLower.includes("yatra") || streamTags.some((t) => t.includes("yatra"));
        }

        if (tag.length > 2 && (streamTitleLower.includes(tag) || streamTags.some((t) => t.includes(tag)))) {
          return true;
        }

        return false;
      })
      .sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0));

    return hashtagMatches.slice(0, limit);
  }

  // Score candidates for Category, Language, or All Related discovery
  const scored = candidateStreams.map((stream) => {
    let score = calculateRelevance(stream, signals, activeQuery);

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

  // When an explicit category or language filter is active:
  // ONLY return streams that ACTUALLY match the filter (score > 0).
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
