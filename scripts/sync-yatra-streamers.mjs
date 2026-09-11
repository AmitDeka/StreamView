import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, "../data/yatra-streamers.json");

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
      if (!GENERIC_PREFIXES.has(prefix)) return true;
    }
  }

  const titleRpMatches = tLower.matchAll(/\b([a-z0-9_]+)\s+(?:rp|roleplay)\b/gi);
  for (const match of titleRpMatches) {
    const prefix = match[1].toLowerCase();
    if (!GENERIC_PREFIXES.has(prefix)) return true;
  }

  return false;
}

function isGenuineYatraStream(stream) {
  if (!stream || !stream.is_live) return false;

  const title = (stream.session_title || stream.title || "").toLowerCase();
  const tags = Array.isArray(stream.tags) ? stream.tags.map((t) => String(t).toLowerCase()) : [];

  const hasYatra = title.includes("yatra") || tags.some((t) => t.includes("yatra"));
  if (!hasYatra) return false;

  if (isDifferentServer(title, tags)) return false;

  return true;
}

async function fetchKickFeed(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.livestreams || data.livestreams || (Array.isArray(data) ? data : []);
  } catch (err) {
    console.warn(`Feed fetch failed for ${url}:`, err.message);
    return [];
  }
}

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

  // Query Kick GTA V (top, low-viewer ascending, page 2) and Hindi live feeds to catch 1-viewer streamers
  const [gtaTop, gtaLowViewers, gtaPage2, hindiStreams] = await Promise.all([
    fetchKickFeed("https://kick.com/api/v2/subcategories/grand-theft-auto-v/livestreams?limit=100"),
    fetchKickFeed("https://kick.com/api/v2/subcategories/grand-theft-auto-v/livestreams?limit=100&sort=viewers_asc"),
    fetchKickFeed("https://kick.com/api/v2/subcategories/grand-theft-auto-v/livestreams?limit=100&page=2"),
    fetchKickFeed("https://kick.com/api/v2/languages/hi/livestreams?limit=100"),
  ]);

  const allStreams = [...gtaTop, ...gtaLowViewers, ...gtaPage2, ...hindiStreams];
  console.log(`Fetched ${allStreams.length} total live streams across multiple Kick feeds to analyze.`);

  const discovered = new Set();
  for (const s of allStreams) {
    if (isGenuineYatraStream(s)) {
      const channelSlug = (s.channel?.slug || s.slug || "").trim().toLowerCase();
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
