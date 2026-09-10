import https from "node:https";
import http from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let proxyAgent = null;
const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY;
if (proxyUrl) {
  try {
    const { HttpsProxyAgent } = require("next/dist/compiled/https-proxy-agent");
    proxyAgent = new HttpsProxyAgent(proxyUrl);
  } catch (e) {
    // If not found, ignore
  }
}

/**
 * Universal fetcher for Kick public and authenticated endpoints.
 * Automatically tunnels through HTTP(S) proxy when configured in environment.
 */
export async function kickFetch(url, options = {}) {
  const { timeout = 5000, headers = {} } = options;
  const mergedHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    ...headers,
  };

  if (proxyAgent) {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === "https:";
        const lib = isHttps ? https : http;

        const req = lib.get(url, {
          agent: proxyAgent,
          headers: mergedHeaders,
          timeout,
        }, (res) => {
          let body = "";
          res.on("data", (chunk) => { body += chunk; });
          res.on("end", () => {
            try {
              const data = JSON.parse(body);
              resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                json: async () => data,
                text: async () => body,
              });
            } catch (err) {
              resolve({
                ok: false,
                status: res.statusCode,
                json: async () => null,
                text: async () => body,
              });
            }
          });
        });

        req.on("timeout", () => {
          req.destroy();
          resolve({ ok: false, status: 408, json: async () => null });
        });
        req.on("error", () => {
          resolve({ ok: false, status: 500, json: async () => null });
        });
      } catch (err) {
        resolve({ ok: false, status: 500, json: async () => null });
      }
    });
  }

  // Native fetch fallback
  try {
    const res = await fetch(url, {
      headers: mergedHeaders,
      signal: AbortSignal.timeout(timeout),
    });
    return res;
  } catch (err) {
    return {
      ok: false,
      status: 500,
      json: async () => null,
      text: async () => "",
    };
  }
}

/**
 * Server-side Kick API Client.
 * Handles OAuth 2.0 app credentials flow and authenticated requests.
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
    const res = await kickFetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
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

  const channelName =
    raw.channel?.slug || raw.slug || raw.channel_name || raw.username || "Unknown";

  const isLive = Boolean(raw.is_live ?? (raw.livestream ? raw.livestream.is_live : true));

  const title =
    raw.session_title ||
    raw.livestream?.session_title ||
    raw.title ||
    `${channelName}'s Stream`;

  const category =
    raw.category?.name ||
    raw.categories?.[0]?.name ||
    raw.subcategory?.name ||
    raw.livestream?.categories?.[0]?.name ||
    raw.recent_categories?.[0]?.name ||
    raw.category_name ||
    "Just Chatting";

  const language =
    raw.language || raw.livestream?.language || "English";

  const viewerCount = Number(
    raw.viewer_count ??
    raw.viewers ??
    raw.livestream?.viewer_count ??
    0
  );

  const thumbUrl =
    raw.thumbnail?.src ||
    raw.thumbnail?.url ||
    raw.livestream?.thumbnail?.url ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80";

  const profilePic =
    raw.user?.profile_pic ||
    raw.user?.profilepic ||
    raw.channel?.user?.profile_pic ||
    raw.channel?.user?.profilepic ||
    raw.channel?.profile_pic ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${channelName}&backgroundColor=b6e3f4,c0aede`;

  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  return {
    id: raw.id ? String(raw.id) : `kick_${channelName}`,
    channelName,
    title,
    category,
    language,
    viewerCount,
    thumbnailUrl: thumbUrl,
    avatarUrl: profilePic,
    isLive,
    tags,
  };
}
