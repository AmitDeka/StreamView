export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getRelatedStreams } from "@/lib/kick/search";
import { getStreamByChannel } from "@/lib/kick/streams";
import { extractDiscoverySignals } from "@/lib/discovery/signals";
import { rememberYatraChannel } from "@/lib/kick/yatra";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel");
    const activeFilter = searchParams.get("filter") || "";
    const activeQuery = searchParams.get("q") || "";
    const exclude = searchParams.get("exclude") ? searchParams.get("exclude").split(",") : [];
    const known = searchParams.get("known");

    if (known) {
      const knownList = known.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
      for (const ch of knownList) {
        rememberYatraChannel(ch);
      }
    }

    let referenceStream = null;
    if (channel) {
      referenceStream = await getStreamByChannel(channel);
    }

    const streams = await getRelatedStreams(referenceStream, {
      activeFilter,
      activeQuery,
      excludeChannelNames: exclude,
      limit: 20,
    });

    const signals = referenceStream ? extractDiscoverySignals(referenceStream) : null;

    return NextResponse.json({
      success: true,
      data: streams,
      signals,
      reference: referenceStream,
    });
  } catch (err) {
    console.error("API /api/kick/related GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to discover related streams" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { referenceStream, activeFilter, activeQuery, excludeChannelNames, limit } = body;

    const streams = await getRelatedStreams(referenceStream, {
      activeFilter,
      activeQuery,
      excludeChannelNames: excludeChannelNames || [],
      limit: limit || 20,
    });

    const signals = referenceStream ? extractDiscoverySignals(referenceStream) : null;

    return NextResponse.json({
      success: true,
      data: streams,
      signals,
      reference: referenceStream,
    });
  } catch (err) {
    console.error("API /api/kick/related POST error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to discover related streams" },
      { status: 500 }
    );
  }
}
