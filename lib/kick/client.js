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
 * Supports GET, POST, custom headers, and request bodies.
 */
export async function kickFetch(url, options = {}) {
  const { timeout = 6000, headers = {}, method = "GET", body } = options;
  const mergedHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://kick.com/",
    ...headers,
  };

  if (proxyAgent) {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === "https:";
        const lib = isHttps ? https : http;

        const reqOptions = {
          method,
          agent: proxyAgent,
          headers: { ...mergedHeaders },
          timeout,
        };

        let postBody = null;
        if (body) {
          postBody = typeof body === "string" ? body : (body instanceof URLSearchParams ? body.toString() : JSON.stringify(body));
          reqOptions.headers["Content-Length"] = Buffer.byteLength(postBody);
        }

        const req = lib.request(url, reqOptions, (res) => {
          let resBody = "";
          res.on("data", (chunk) => { resBody += chunk; });
          res.on("end", () => {
            try {
              const data = JSON.parse(resBody);
              resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                json: async () => data,
                text: async () => resBody,
              });
            } catch (err) {
              resolve({
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                json: async () => null,
                text: async () => resBody,
              });
            }
          });
        });

        req.on("timeout", () => {
          req.destroy();
          resolve({ ok: false, status: 408, json: async () => null, text: async () => "" });
        });
        req.on("error", (err) => {
          resolve({ ok: false, status: 500, json: async () => null, text: async () => err.message });
        });

        if (postBody) {
          req.write(postBody);
        }
        req.end();
      } catch (err) {
        resolve({ ok: false, status: 500, json: async () => null, text: async () => err.message });
      }
    });
  }

  // Native fetch fallback
  try {
    const fetchOptions = {
      method,
      headers: mergedHeaders,
      signal: AbortSignal.timeout(timeout),
    };
    if (body) {
      fetchOptions.body = typeof body === "string" ? body : (body instanceof URLSearchParams ? body.toString() : JSON.stringify(body));
    }
    const res = await fetch(url, fetchOptions);
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
 * Uses environment credentials or default developer credentials.
 */
let cachedToken = null;
let tokenExpiresAt = 0;

export async function getKickAppToken() {
  const clientId = process.env.KICK_CLIENT_ID || "01M1ZR665S7GT6MPVCM41QQ8Q8";
  const clientSecret = process.env.KICK_CLIENT_SECRET || "a92391f4c5f761e2150286661e9fb507bb3e39b58baf06290f01da54950f8b27";

  if (!clientId || !clientSecret) {
    return null;
  }

  // Check if token is still valid (with 60-second buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const bodyParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await kickFetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
      timeout: 6000,
    });

    if (!res.ok) {
      console.warn("Kick OAuth failed with status", res.status);
      return null;
    }

    const data = await res.json();
    if (data && data.access_token) {
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return cachedToken;
    }
    return null;
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

  const isLive = Boolean(
    raw.is_live ??
    raw.stream?.is_live ??
    (raw.livestream ? raw.livestream.is_live : true)
  );

  const title =
    raw.stream_title ||
    raw.session_title ||
    raw.stream?.session_title ||
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
    raw.language ||
    raw.stream?.language ||
    raw.livestream?.language ||
    "English";

  const viewerCount = Number(
    raw.viewer_count ??
    raw.stream?.viewer_count ??
    raw.viewers ??
    raw.livestream?.viewer_count ??
    0
  );

  const thumbUrl =
    (typeof raw.thumbnail === "string" ? raw.thumbnail : raw.thumbnail?.src || raw.thumbnail?.url) ||
    raw.stream?.thumbnail ||
    raw.livestream?.thumbnail?.url ||
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop&q=80";

  const profilePic =
    raw.profile_picture ||
    raw.user?.profile_pic ||
    raw.user?.profilepic ||
    raw.channel?.user?.profile_pic ||
    raw.channel?.user?.profilepic ||
    raw.channel?.profile_pic ||
    raw.banner_picture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${channelName}&backgroundColor=b6e3f4,c0aede`;

  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  return {
    id: raw.id ? String(raw.id) : (raw.channel_id ? `kick_${raw.channel_id}` : `kick_${channelName}`),
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
