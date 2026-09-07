export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { searchStreams } from "@/lib/kick/search";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const exclude = searchParams.get("exclude") ? searchParams.get("exclude").split(",") : [];
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const streams = await searchStreams(query, {
      excludeChannelNames: exclude,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: streams,
      count: streams.length,
    });
  } catch (err) {
    console.error("API /api/kick/search error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to search streams" },
      { status: 500 }
    );
  }
}
