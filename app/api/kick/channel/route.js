export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

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

    const res = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanName)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      next: { revalidate: 30 },
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
    const isLive = Boolean(data.livestream);
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
