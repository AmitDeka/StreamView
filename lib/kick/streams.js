import { getKickAppToken, normalizeKickStream } from "./client";
import { MOCK_STREAMS } from "./mock-data";

/**
 * Retrieves currently live streams.
 * If Kick API credentials exist, calls the official documented endpoints.
 * Otherwise, falls back to realistic mock streams.
 */
export async function getLiveStreams(limit = 20) {
  const token = await getKickAppToken();

  if (token) {
    try {
      const res = await fetch(`https://api.kick.com/public/v1/livestreams?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: { revalidate: 30 }, // cache for 30s to respect rate limits
      });

      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || json.livestreams || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          return rawList.map(normalizeKickStream).filter(Boolean);
        }
      }
    } catch (err) {
      console.warn("Kick API livestreams request failed, falling back to mock:", err.message);
    }
  }

  // Fallback to mock data
  return MOCK_STREAMS.slice(0, limit);
}

/**
 * Retrieves stream by channel slug/name.
 */
export async function getStreamByChannel(channelName) {
  if (!channelName) return null;
  const nameLower = channelName.toLowerCase();

  const token = await getKickAppToken();
  if (token) {
    try {
      const res = await fetch(`https://api.kick.com/public/v1/channels/${encodeURIComponent(channelName)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      });

      if (res.ok) {
        const json = await res.json();
        return normalizeKickStream(json.data || json);
      }
    } catch (err) {
      console.warn("Kick API channel lookup failed, falling back to mock:", err.message);
    }
  }

  // Fallback to mock if matched
  const match = MOCK_STREAMS.find(s => s.channelName.toLowerCase() === nameLower);
  if (match) return match;

  // Query Kick's public channel API for real avatar, live status, and viewer count
  try {
    const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(nameLower)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) {
        const profilePic = data.user?.profile_pic || data.user?.profilepic || null;
        const isLive = Boolean(data.livestream);
        const viewerCount = isLive && typeof data.livestream?.viewer_count === "number" ? data.livestream.viewer_count : null;
        return {
          id: `kick_${data.slug}`,
          channelName: data.slug,
          title: data.livestream?.session_title || `${data.slug}'s Stream`,
          category: data.livestream?.categories?.[0]?.name || data.recent_categories?.[0]?.name || "Just Chatting",
          language: data.livestream?.language || "English",
          viewerCount, // null if offline or not available
          thumbnailUrl: data.livestream?.thumbnail?.url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80",
          avatarUrl: profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.slug}&backgroundColor=b6e3f4,c0aede`,
          isLive,
          tags: ["Live Stream"],
        };
      }
    }
  } catch (err) {}

  // Fallback placeholder with null viewer count if cannot be fetched
  return {
    id: `stream_${channelName}`,
    channelName: channelName,
    title: `${channelName}'s Kick Stream`,
    category: "Live Gaming",
    language: "English",
    viewerCount: null, // live count cannot be fetched -> null
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80",
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${channelName}&backgroundColor=b6e3f4,c0aede`,
    isLive: true,
    tags: ["Live"],
  };
}
