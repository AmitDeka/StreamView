export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resolveYouTubeStream } from "@/lib/youtube/resolve";

export async function GET(request) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };

  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url") || searchParams.get("q") || "";

    if (!url.trim()) {
      return NextResponse.json(
        { success: false, error: "YouTube URL or Video ID is required" },
        { status: 400, headers }
      );
    }

    const stream = await resolveYouTubeStream(url);

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Could not resolve a valid YouTube stream from this URL" },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { success: true, data: stream },
      { headers }
    );
  } catch (err) {
    console.error("API /api/youtube/resolve error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to resolve YouTube stream" },
      { status: 500, headers }
    );
  }
}
