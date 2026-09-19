export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getStreamByChannel } from "@/lib/kick/streams";
import { kickFetch } from "@/lib/kick/client";

export async function GET(request) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };

  try {
    const { searchParams } = new URL(request.url);
    const channelName = searchParams.get("name");

    if (!channelName) {
      return NextResponse.json(
        { success: false, error: "Channel name is required" },
        { status: 400, headers }
      );
    }

    const cleanName = channelName.trim().toLowerCase();

    const stream = await getStreamByChannel(cleanName, true);
    if (stream) {
      return NextResponse.json(
        {
          success: true,
          data: {
            channelName: stream.channelName,
            displayName: stream.channelName,
            avatarUrl: stream.avatarUrl,
            viewerCount: stream.viewerCount,
            title: stream.title,
            category: stream.category,
            isLive: stream.isLive,
          },
        },
        { headers }
      );
    }

    try {
      const res = await kickFetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanName)}`, {
        timeout: 3500,
      });

      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.user?.profile_pic || data.user?.profilepic || null;
        const isLive = Boolean(data.livestream && data.livestream.is_live);

        const viewerCount =
          isLive && typeof data.livestream?.viewer_count === "number"
            ? data.livestream.viewer_count
            : null;
        const title = data.livestream?.session_title || null;
        const category =
          data.livestream?.categories?.[0]?.name ||
          data.recent_categories?.[0]?.name ||
          null;

        return NextResponse.json(
          {
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
          },
          { headers }
        );
      }
    } catch (e) {
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          channelName: cleanName,
          displayName: cleanName,
          avatarUrl: null,
          viewerCount: null,
          title: null,
          category: null,
          isLive: false,
        },
      },
      { headers }
    );
  } catch (err) {
    console.warn("Channel lookup error:", err.message);
    return NextResponse.json(
      {
        success: true,
        data: {
          channelName: "",
          avatarUrl: null,
          viewerCount: null,
          title: null,
          category: null,
          isLive: false,
        },
      },
      { headers }
    );
  }
}
