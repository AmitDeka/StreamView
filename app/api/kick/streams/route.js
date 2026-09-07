export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getLiveStreams } from "@/lib/kick/streams";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const streams = await getLiveStreams(limit);

    return NextResponse.json({
      success: true,
      data: streams,
    });
  } catch (err) {
    console.error("API /api/kick/streams error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live streams" },
      { status: 500 }
    );
  }
}
