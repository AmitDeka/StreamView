export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchStreams } from "@/lib/kick/search";
import { rememberYatraChannel } from "@/lib/kick/yatra";

export async function GET(request) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const exclude = searchParams.get("exclude") ? searchParams.get("exclude").split(",") : [];
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const known = searchParams.get("known");

    if (known) {
      const knownList = known.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
      for (const ch of knownList) {
        rememberYatraChannel(ch);
      }
    }

    const streams = await searchStreams(query, {
      excludeChannelNames: exclude,
      limit,
    });

    return NextResponse.json(
      {
        success: true,
        data: streams,
        count: streams.length,
      },
      { headers }
    );
  } catch (err) {
    console.error("API /api/kick/search error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to search streams" },
      { status: 500, headers }
    );
  }
}
