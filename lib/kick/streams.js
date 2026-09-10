import { getKickAppToken, kickFetch, normalizeKickStream } from "./client.js";

/**
 * Known subcategory slug mappings for popular games/categories on Kick.
 */
export const CATEGORY_SLUGS = {
  "valorant": "valorant",
  "gta v": "grand-theft-auto-v",
  "gta 5": "grand-theft-auto-v",
  "gta rp": "grand-theft-auto-v",
  "gtav": "grand-theft-auto-v",
  "grand theft auto": "grand-theft-auto-v",
  "grand theft auto v": "grand-theft-auto-v",
  "counter-strike 2": "counter-strike-2",
  "counter strike 2": "counter-strike-2",
  "counter strike": "counter-strike-2",
  "cs2": "counter-strike-2",
  "just chatting": "just-chatting",
  "call of duty": "call-of-duty-warzone",
  "call of duty: warzone": "call-of-duty-warzone",
  "warzone": "call-of-duty-warzone",
  "cod": "call-of-duty-warzone",
  "apex legends": "apex-legends",
  "apex": "apex-legends",
  "fortnite": "fortnite",
  "minecraft": "minecraft",
  "league of legends": "league-of-legends",
  "overwatch 2": "overwatch-2",
  "dota 2": "dota-2",
  "slots": "slots-casino",
  "casino": "slots-casino",
};

/**
 * Known Kick official category IDs for high-traffic categories.
 */
export const CATEGORY_IDS = {
  "valorant": 64,
  "gta v": 8,
  "gta 5": 8,
  "gta rp": 8,
  "gtav": 8,
  "grand theft auto": 8,
  "grand theft auto v": 8,
  "grand-theft-auto-v": 8,
  "counter-strike 2": 1552,
  "counter-strike-2": 1552,
  "counter strike 2": 1552,
  "counter strike": 1552,
  "cs2": 1552,
  "just chatting": 15,
  "just-chatting": 15,
  "call of duty": 754,
  "call-of-duty-warzone": 754,
  "call of duty: warzone": 754,
  "warzone": 754,
  "cod": 754,
  "apex legends": 1,
  "apex": 1,
  "apex-legends": 1,
  "fortnite": 3,
  "minecraft": 13,
  "league of legends": 14,
  "league-of-legends": 14,
  "overwatch 2": 66,
  "overwatch-2": 66,
  "dota 2": 10,
  "dota-2": 10,
  "slots": 68,
  "casino": 68,
  "slots-casino": 68,
};

/**
 * Language code mappings for Kick public endpoints.
 */
export const LANGUAGE_CODES = {
  "hindi": "hi",
  "english": "en",
  "spanish": "es",
  "espanol": "es",
  "portuguese": "pt",
  "french": "fr",
  "german": "de",
  "arabic": "ar",
  "turkish": "tr",
  "japanese": "ja",
  "korean": "ko",
};

/**
 * Fetches live streams for a specific Kick game/subcategory.
 * Queries official Kick Developer API first (bypassing cloud IP restrictions),
 * and gracefully falls back to public endpoints.
 */
export async function fetchSubcategoryStreams(slugOrName, limit = 25) {
  if (!slugOrName) return [];
  const target = String(slugOrName).trim().toLowerCase();

  const token = await getKickAppToken();
  if (token) {
    try {
      let categoryId = CATEGORY_IDS[target] || CATEGORY_IDS[CATEGORY_SLUGS[target]];

      // If not in static dictionary, query official Kick category search
      if (!categoryId) {
        const catRes = await kickFetch(`https://api.kick.com/public/v1/categories?q=${encodeURIComponent(target)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 4000,
        });
        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson?.data?.[0]?.id) {
            categoryId = catJson.data[0].id;
          }
        }
      }

      if (categoryId) {
        const res = await kickFetch(`https://api.kick.com/public/v1/livestreams?category_id=${categoryId}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 5000,
        });

        if (res.ok) {
          const json = await res.json();
          const rawList = json.data || [];
          const streams = rawList.map(normalizeKickStream).filter((s) => s && s.isLive);
          if (streams.length > 0) {
            return streams.slice(0, limit);
          }
        }
      }
    } catch (err) {
      console.warn(`Official Kick API category fetch failed for ${target}:`, err.message);
    }
  }

  // Fallback to public endpoints
  try {
    const slug = CATEGORY_SLUGS[target] || target.replace(/[^a-z0-9]+/g, "-");
    const res = await kickFetch(`https://kick.com/stream/livestreams/en?subcategory=${encodeURIComponent(slug)}`, {
      timeout: 4500,
    });
    if (res.ok) {
      const json = await res.json();
      const rawList = json.data || [];
      return rawList
        .map(normalizeKickStream)
        .filter((s) => s && s.isLive)
        .slice(0, limit);
    }
  } catch (err) {
    console.warn(`Public subcategory streams failed for ${target}:`, err.message);
  }

  return [];
}

/**
 * Fetches live streams for a specific language from Kick.
 * Queries official Kick Developer API first with language filter.
 */
export async function fetchLanguageStreams(langCode = "en", limit = 25) {
  const code = (langCode || "en").toLowerCase();

  const token = await getKickAppToken();
  if (token) {
    try {
      const res = await kickFetch(`https://api.kick.com/public/v1/livestreams?language=${encodeURIComponent(code)}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || [];
        const streams = rawList.map(normalizeKickStream).filter((s) => s && s.isLive);
        if (streams.length > 0) {
          return streams.slice(0, limit);
        }
      }
    } catch (err) {
      console.warn(`Official Kick API language fetch failed for ${code}:`, err.message);
    }
  }

  // Fallback to public stream endpoints
  const results = [];
  const seen = new Set();
  try {
    const [resFeatured, resLive] = await Promise.allSettled([
      kickFetch(`https://kick.com/stream/featured-livestreams/${encodeURIComponent(code)}`, { timeout: 4500 }),
      kickFetch(`https://kick.com/stream/livestreams/${encodeURIComponent(code)}`, { timeout: 4500 }),
    ]);

    for (const p of [resFeatured, resLive]) {
      if (p.status === "fulfilled" && p.value && p.value.ok) {
        const json = await p.value.json();
        const rawList = json.data || [];
        for (const raw of rawList) {
          const stream = normalizeKickStream(raw);
          if (stream && stream.isLive && !seen.has(stream.channelName.toLowerCase())) {
            seen.add(stream.channelName.toLowerCase());
            if (code === "hi" && (!stream.language || stream.language === "English")) {
              stream.language = "Hindi";
            }
            results.push(stream);
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Public language streams failed for ${code}:`, err.message);
  }

  return results.slice(0, limit);
}

/**
 * Retrieves currently LIVE streams directly from Kick.
 * Supports limit or options object: { limit, subcategory, language }.
 * Only returns active broadcasts (no offline dummy data).
 */
export async function getLiveStreams(limitOrOptions = 30) {
  const options = typeof limitOrOptions === "object" ? limitOrOptions : { limit: limitOrOptions };
  const { limit = 30, subcategory, language } = options;

  const streamMap = new Map();

  // If a specific subcategory or language was targeted, fetch those first
  if (subcategory) {
    const subStreams = await fetchSubcategoryStreams(subcategory, limit);
    subStreams.forEach((s) => streamMap.set(s.channelName.toLowerCase(), s));
  }

  if (language) {
    const langStreams = await fetchLanguageStreams(language, limit);
    langStreams.forEach((s) => streamMap.set(s.channelName.toLowerCase(), s));
  }

  const token = await getKickAppToken();
  if (token) {
    try {
      const res = await kickFetch(`https://api.kick.com/public/v1/livestreams?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 4000,
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || json.livestreams || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const streams = rawList.map(normalizeKickStream).filter((s) => s && s.isLive);
          streams.forEach((s) => {
            if (!streamMap.has(s.channelName.toLowerCase())) {
              streamMap.set(s.channelName.toLowerCase(), s);
            }
          });
        }
      }
    } catch (err) {
      console.warn("Official Kick API livestreams request failed:", err.message);
    }
  }

  // If we already have sufficient streams from official API, return immediately!
  if (streamMap.size >= limit) {
    return Array.from(streamMap.values()).slice(0, limit);
  }

  // Fetch live streams from Kick public stream endpoints in parallel (featured + multi-page livestreams)
  try {
    const [resFeaturedEn, resFeaturedHi, resLiveP1, resLiveP2] = await Promise.allSettled([
      kickFetch("https://kick.com/stream/featured-livestreams/en", { timeout: 4500 }),
      kickFetch("https://kick.com/stream/featured-livestreams/hi", { timeout: 4500 }),
      kickFetch("https://kick.com/stream/livestreams/en?page=1", { timeout: 4500 }),
      kickFetch("https://kick.com/stream/livestreams/en?page=2", { timeout: 4500 }),
    ]);

    for (const p of [resFeaturedEn, resFeaturedHi, resLiveP1, resLiveP2]) {
      if (p.status === "fulfilled" && p.value && p.value.ok) {
        const json = await p.value.json();
        const rawList = json.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          for (const raw of rawList) {
            const s = normalizeKickStream(raw);
            if (s && s.isLive && !streamMap.has(s.channelName.toLowerCase())) {
              streamMap.set(s.channelName.toLowerCase(), s);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Public Kick livestreams request failed:", err.message);
  }

  return Array.from(streamMap.values()).slice(0, limit);
}

/**
 * Retrieves stream by channel slug/name ONLY if currently live on Kick.
 * Returns null if the channel is offline or does not exist (no offline dummy data).
 */
export async function getStreamByChannel(channelName) {
  if (!channelName) return null;
  const nameLower = channelName.trim().toLowerCase();

  const token = await getKickAppToken();
  if (token) {
    try {
      const res = await kickFetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(nameLower)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 4500,
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          const raw = rawList[0];
          const stream = normalizeKickStream(raw);
          if (stream && stream.isLive) {
            return stream;
          }
          return null;
        }
      }
    } catch (err) {
      console.warn("Official Kick API channel lookup failed:", err.message);
    }
  }

  // Query Kick's public channel API for real livestream status
  try {
    const res = await kickFetch(`https://kick.com/api/v2/channels/${encodeURIComponent(nameLower)}`, {
      timeout: 3500,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) {
        // Stale session filter: Check that stream is truly live with an active video thumbnail or recent start
        const hasLiveThumbnail = Boolean(data.livestream?.thumbnail?.url || data.livestream?.thumbnail?.src);
        const startTime = new Date(data.livestream?.start_time || data.livestream?.created_at || "").getTime();
        const isRecentStart = !isNaN(startTime) && (Date.now() - startTime < 10 * 60 * 1000);
        const isLive = Boolean(data.livestream?.is_live && (hasLiveThumbnail || isRecentStart));

        // If not live, return null: NO OFFLINE DUMMY DATA
        if (!isLive) {
          return null;
        }

        const profilePic = data.user?.profile_pic || data.user?.profilepic || null;
        const viewerCount =
          typeof data.livestream?.viewer_count === "number" ? data.livestream.viewer_count : 0;
        const sessionTitle = data.livestream?.session_title || `${data.slug}'s Stream`;

        return {
          id: `kick_${data.slug}`,
          channelName: data.slug,
          title: sessionTitle,
          category:
            data.livestream?.categories?.[0]?.name ||
            data.recent_categories?.[0]?.name ||
            "Just Chatting",
          language: data.livestream?.language || "English",
          viewerCount,
          thumbnailUrl:
            data.livestream?.thumbnail?.src ||
            data.livestream?.thumbnail?.url ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80",
          avatarUrl:
            profilePic ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${data.slug}&backgroundColor=b6e3f4,c0aede`,
          isLive: true,
          tags: Array.isArray(data.livestream?.tags) ? data.livestream.tags : ["Live Stream"],
        };
      }
    }
  } catch (err) {
    // ignore
  }

  // Channel is offline or not found - return null (no dummy data)
  return null;
}
