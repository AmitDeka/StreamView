import { getKickAppToken, kickFetch, normalizeKickStream } from "./client.js";

/**
 * Retrieves currently LIVE streams directly from Kick.
 * Only returns active broadcasts (no offline dummy data).
 */
export async function getLiveStreams(limit = 20) {
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
          if (streams.length > 0) return streams.slice(0, limit);
        }
      }
    } catch (err) {
      console.warn("Kick API livestreams request failed:", err.message);
    }
  }

  // Fetch live streams from Kick public stream endpoint
  try {
    const res = await kickFetch("https://kick.com/stream/featured-livestreams/en", {
      timeout: 5000,
    });

    if (res.ok) {
      const json = await res.json();
      const rawList = json.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        const liveStreams = rawList
          .map(normalizeKickStream)
          .filter((s) => s && s.isLive);

        if (liveStreams.length > 0) {
          return liveStreams.slice(0, limit);
        }
      }
    }
  } catch (err) {
    console.warn("Kick public featured livestreams request failed:", err.message);
  }

  return [];
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
      const res = await kickFetch(`https://api.kick.com/public/v1/channels/${encodeURIComponent(nameLower)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 3000,
      });

      if (res.ok) {
        const json = await res.json();
        const stream = normalizeKickStream(json.data || json);
        if (stream && stream.isLive) {
          return stream;
        }
        return null;
      }
    } catch (err) {
      console.warn("Kick API channel lookup failed:", err.message);
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
