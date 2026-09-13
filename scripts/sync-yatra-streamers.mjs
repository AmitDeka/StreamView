import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "../data/yatra-streamers.json");

// Automatically load .env.local when running locally
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://kick.com/",
};

const OTHER_KNOWN_SERVERS = [
  "soulcity", "lifeinsoulcity", "soul city",
  "subharambh", "gloryrp", "glory rp",
  "legacyrp", "legacy rp", "echorp", "echo rp",
  "nexus", "nexusrp", "svrp", "hydrarp", "hydra rp",
  "delhirp", "mumbairp", "nopixel", "rivals", "grandrp", "cityliferp"
];

const GENERIC_PREFIXES = new Set([
  "yatra", "gta", "v", "gtav", "gta5", "fivem", "five m",
  "indian", "india", "hindi", "best", "new", "live", "my", "the"
]);

function isDifferentServer(title, tags) {
  const tLower = (title || "").toLowerCase();
  const tagList = Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase()) : [];

  if (OTHER_KNOWN_SERVERS.some((srv) => tLower.includes(srv) || tagList.some((t) => t.includes(srv)))) {
    return true;
  }

  for (const tag of tagList) {
    const hashMatch = tag.match(/^#?([a-z0-9_]+?)(?:rp|roleplay)$/i);
    if (hashMatch) {
      const prefix = hashMatch[1].toLowerCase();
      if (!GENERIC_PREFIXES.has(prefix) && !prefix.startsWith("yatra")) return true;
    }
  }

  const titleRpMatches = tLower.matchAll(/\b([a-z0-9_]+)\s+(?:rp|roleplay)\b/gi);
  for (const match of titleRpMatches) {
    const prefix = match[1].toLowerCase();
    if (!GENERIC_PREFIXES.has(prefix) && !prefix.startsWith("yatra")) return true;
  }

  return false;
}

function isGenuineYatraStream(stream) {
  if (!stream) return false;
  const isLive = Boolean(stream.is_live ?? stream.stream?.is_live ?? true);
  if (!isLive) return false;

  const title = (
    stream.stream_title ||
    stream.session_title ||
    stream.title ||
    stream.livestream?.session_title ||
    ""
  ).toLowerCase();

  const tags = Array.isArray(stream.tags) ? stream.tags.map((t) => String(t).toLowerCase()) : [];

  const hasYatra = title.includes("yatra") || tags.some((t) => t.includes("yatra"));
  if (!hasYatra) return false;

  if (isDifferentServer(title, tags)) return false;

  return true;
}

// Kick OAuth token acquisition using client credentials
async function getKickAppToken() {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const bodyParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    });

    if (!res.ok) {
      console.warn("Kick OAuth failed with status", res.status);
      return null;
    }

    const data = await res.json();
    return data?.access_token || null;
  } catch (err) {
    console.warn("Failed to obtain Kick OAuth token:", err.message);
    return null;
  }
}

// Fetch official Kick developer API livestreams (no Cloudflare 403 on GitHub Actions)
async function fetchKickApiLivestreams(url, token) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`Kick API HTTP ${res.status}: ${url}`);
      return [];
    }
    const json = await res.json();
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
  } catch (err) {
    console.warn(`Kick API fetch failed for ${url}:`, err.message);
    return [];
  }
}

// Fetch official Kick developer API channel
async function fetchKickApiChannel(slug, token) {
  try {
    const clean = String(slug).trim().toLowerCase();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${encodeURIComponent(clean)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    const channel = json.data?.[0];
    if (channel?.stream && channel.stream.is_live) {
      return {
        ...channel,
        slug: channel.slug || clean,
        stream_title: channel.stream_title || "",
        is_live: true,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Fallback fetchers for unauthenticated environments
async function fetchKickFeed(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`Feed HTTP ${res.status}: ${url}`);
      return [];
    }
    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.data?.livestreams)) return json.data.livestreams;
    if (Array.isArray(json.livestreams)) return json.livestreams;
    return [];
  } catch (err) {
    console.warn(`Feed fetch failed for ${url}:`, err.message);
    return [];
  }
}

async function fetchChannelLivestream(slug) {
  try {
    const clean = String(slug).trim().toLowerCase();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(clean)}`, {
      headers: HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.livestream && data.livestream.is_live) {
      return {
        ...data.livestream,
        channel: { slug: clean },
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Known community candidates to verify directly if absent from roster
const CANDIDATE_CHANNELS = [
  "shreeplayz",
  "gunshot",
  "hathoda",
  "qayzer4",
  "onhypegamer",
  "imrocky",
  "candidgaming",
  "thunderboltgaming",
  "kryzor9",
  "chhabrasaab",
  "gamergill",
  "stelvin777",
  "marcyxd",
  "fluffy-gaming",
  "ssplayzz",
  "nikita_playzz",
  "exion",
  "prathmesh_gaming",
  "ft-aqua-is-live",
  "tvfonchi",
  "rakazone",
  "rakazonegaming",
  "tbone_gaming",
  "asukabae",
  "mackletv",
  "baggaislive",
  "itzzvegeta",
];

async function run() {
  console.log("Starting Yatra Roleplay streamer discovery sync...");

  let currentList = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      currentList = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to read current streamers list:", err.message);
    process.exit(1);
  }

  const currentSet = new Set(currentList.map((c) => String(c).trim().toLowerCase()));
  console.log(`Current roster has ${currentSet.size} creators.`);

  // Candidates not in the current roster to probe directly
  const missingCandidates = CANDIDATE_CHANNELS.filter((c) => !currentSet.has(c));

  let allStreams = [];
  const token = await getKickAppToken();

  if (token) {
    console.log("Kick OAuth token acquired. Using official Kick Developer API v1 (bypasses Cloudflare).");
    const apiEndpoints = [
      "https://api.kick.com/public/v1/livestreams?category_id=8&limit=100",
      "https://api.kick.com/public/v1/livestreams?language=en&category_id=8&limit=100",
      "https://api.kick.com/public/v1/livestreams?language=hi&category_id=8&limit=100",
      "https://api.kick.com/public/v1/livestreams?language=en&limit=100",
      "https://api.kick.com/public/v1/livestreams?language=hi&limit=100",
      "https://api.kick.com/public/v1/livestreams?limit=100",
    ];

    const [feedResults, candidateResults] = await Promise.all([
      Promise.all(apiEndpoints.map((url) => fetchKickApiLivestreams(url, token))),
      Promise.all(missingCandidates.map((slug) => fetchKickApiChannel(slug, token))),
    ]);

    allStreams = [
      ...feedResults.flat(),
      ...candidateResults.filter(Boolean),
    ];
  } else {
    console.warn("WARNING: Kick API credentials (KICK_CLIENT_ID / KICK_CLIENT_SECRET) not set. Falling back to public feed endpoints (may be blocked by Cloudflare on GitHub Actions).");
    const feedUrls = [
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=desc&limit=50&page=1",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=desc&limit=50&page=2",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=desc&limit=50&page=3",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=asc&limit=50&page=1",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=asc&limit=50&page=2",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=asc&limit=50&page=3",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&sort=asc&limit=50&page=4",
      "https://kick.com/stream/livestreams/en?subcategory=grand-theft-auto-v&limit=50&page=1",
      "https://kick.com/stream/livestreams/hi",
      "https://kick.com/stream/featured-livestreams/hi",
    ];

    const [feedResults, candidateResults] = await Promise.all([
      Promise.all(feedUrls.map((url) => fetchKickFeed(url))),
      Promise.all(missingCandidates.map((slug) => fetchChannelLivestream(slug))),
    ]);

    allStreams = [
      ...feedResults.flat(),
      ...candidateResults.filter(Boolean),
    ];
  }

  console.log(`Fetched ${allStreams.length} total live streams across Kick API and candidates.`);

  const discovered = new Set();
  for (const s of allStreams) {
    if (isGenuineYatraStream(s)) {
      const channelSlug = (
        s.slug ||
        s.channel?.slug ||
        s.username ||
        ""
      ).trim().toLowerCase();

      if (channelSlug && !currentSet.has(channelSlug)) {
        discovered.add(channelSlug);
      }
    }
  }

  if (discovered.size === 0) {
    console.log("No new Yatra streamers discovered. Roster is up to date.");
    return;
  }

  console.log(`Discovered ${discovered.size} NEW Yatra streamers:`, Array.from(discovered));

  const updatedList = Array.from(new Set([...currentList, ...discovered]));
  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedList, null, 2) + "\n", "utf-8");
  console.log(`Successfully updated ${DATA_FILE} with ${updatedList.length} total creators.`);

  // If in GitHub Actions, signal that changes occurred
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated=true\ncount=${discovered.size}\n`);
  }
}

run().catch((err) => {
  console.error("Fatal discovery error:", err);
  process.exit(1);
});
