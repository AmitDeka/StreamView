export function extractYouTubeVideoId(input) {
  if (!input) return null;
  const str = String(input).trim();

  const match = str.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (match) {
    return match[1];
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  return null;
}

export async function resolveYouTubeStream(input) {
  if (!input) return null;
  const cleanInput = String(input).trim();

  let videoId = extractYouTubeVideoId(cleanInput);

  if (!videoId && cleanInput.includes("youtube.com/") && (cleanInput.includes("/@") || cleanInput.includes("/channel/") || cleanInput.includes("/c/") || cleanInput.includes("/live"))) {
    try {
      const targetUrl = cleanInput.endsWith("/live")
        ? cleanInput
        : `${cleanInput.replace(/\/+$/, "")}/live`;

      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      const html = await res.text();
      const idMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (idMatch) {
        videoId = idMatch[1];
      }
    } catch (e) {
      console.warn("Failed to resolve YouTube channel live URL", e);
    }
  }

  if (!videoId) return null;

  let title = "YouTube Live Stream";
  let channelName = "YouTube Streamer";
  let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let authorUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
    const oembedRes = await fetch(oembedUrl, {
      next: { revalidate: 300 },
    });
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      if (data.title) title = data.title;
      if (data.author_name) channelName = data.author_name;
      if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      if (data.author_url) authorUrl = data.author_url;
    }
  } catch (e) {
    console.warn("YouTube oEmbed fetch error", e);
  }

  return {
    id: `yt_${videoId}`,
    channelName,
    title,
    category: "YouTube Live",
    language: "YouTube",
    viewerCount: null,
    thumbnailUrl,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(channelName)}&backgroundColor=ffd5dc,ffdfbf`,
    isLive: true,
    platform: "youtube",
    youtubeVideoId: videoId,
    customUrl: `https://www.youtube.com/watch?v=${videoId}`,
    authorUrl,
  };
}
