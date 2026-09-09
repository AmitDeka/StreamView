export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { kickFetch } from "@/lib/kick/client";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get("name");

    if (!channelName) {
      return NextResponse.json(
        { success: false, error: "Channel name is required" },
        { status: 400 }
      );
    }

    const cleanName = channelName.trim().toLowerCase();

    const res = await kickFetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanName)}`, {
      timeout: 3500,
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        data: {
          channelName: cleanName,
          avatarUrl: null,
          viewerCount: null,
          isLive: false,
        },
      });
    }

    const data = await res.json();
    const avatarUrl = data.user?.profile_pic || data.user?.profilepic || null;
    const hasLiveThumbnail = Boolean(data.livestream?.thumbnail?.url);
    const startTime = new Date(data.livestream?.start_time || data.livestream?.created_at || "").getTime();
    const isRecentStart = !isNaN(startTime) && (Date.now() - startTime < 10 * 60 * 1000);
    const isLive = Boolean(data.livestream?.is_live && (hasLiveThumbnail || isRecentStart));

    const viewerCount =
      isLive && typeof data.livestream?.viewer_count === "number"
        ? data.livestream.viewer_count
        : null;
    const title = data.livestream?.session_title || null;
    const category =
      data.livestream?.categories?.[0]?.name ||
      data.recent_categories?.[0]?.name ||
      null;

    return NextResponse.json({
      success: true,
      data: {
        channelName: data.slug || cleanName,
        displayName: data.user?.username || data.slug || cleanName,
        avatarUrl,
        viewerCount,
        title,
        category,
        isLive,
      },
    });
  } catch (err) {
    console.warn("Channel lookup error:", err.message);
    return NextResponse.json({
      success: true,
      data: {
        avatarUrl: null,
        viewerCount: null,
      },
    });
  }
}
