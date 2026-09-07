/**
 * Server-side Kick API Client.
 * Handles OAuth 2.0 app credentials flow and authenticated requests.
 * Only executes server-side.
 */

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getKickAppToken() {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Check if token is still valid (with 60-second buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      // Revalidate / cache settings
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("Kick OAuth failed with status", res.status);
      return null;
    }

    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (err) {
    console.warn("Failed to obtain Kick OAuth token:", err.message);
    return null;
  }
}

/**
 * Normalizes raw Kick API livestream data into StreamView's standard Stream model.
 */
export function normalizeKickStream(raw) {
  if (!raw) return null;
  
  return {
    id: raw.id ? String(raw.id) : `kick_${raw.slug || raw.channel_id}`,
    channelName: raw.channel?.slug || raw.slug || raw.channel_name || raw.username || "Unknown",
    title: raw.session_title || raw.livestream?.session_title || raw.title || "Live Stream",
    category: raw.category?.name || raw.categories?.[0]?.name || raw.category_name || "Just Chatting",
    language: raw.language || raw.livestream?.language || "English",
    viewerCount: Number(raw.viewer_count || raw.viewers || raw.livestream?.viewer_count || 0),
    thumbnailUrl: raw.thumbnail?.url || raw.livestream?.thumbnail?.url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80",
    avatarUrl: raw.user?.profile_pic || raw.channel?.profile_pic || `https://api.dicebear.com/7.x/bottts/svg?seed=${raw.slug || "kick"}&backgroundColor=b6e3f4,c0aede`,
    isLive: Boolean(raw.is_live ?? true),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}
