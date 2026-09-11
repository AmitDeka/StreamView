import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "StreamView - Watch Multiple Kick Streams Together | Dedicated to Yatra RP";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09070C",
          backgroundImage: "radial-gradient(circle at 50% 35%, rgba(255, 138, 42, 0.18), transparent 65%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "48px",
          border: "4px solid rgba(244, 197, 66, 0.45)",
        }}
      >
        {/* Brand Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            backgroundColor: "#1E100F",
            border: "2px solid #F4C542",
            marginBottom: "20px",
            boxShadow: "0 0 30px rgba(244, 197, 66, 0.35)",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", width: "40px", height: "40px", gap: "4px" }}>
            <div style={{ width: "18px", height: "18px", backgroundColor: "#F4C542", borderRadius: "4px" }} />
            <div style={{ width: "18px", height: "18px", backgroundColor: "#FF8A2A", borderRadius: "4px" }} />
            <div style={{ width: "18px", height: "18px", backgroundColor: "#E13D32", borderRadius: "4px" }} />
            <div style={{ width: "18px", height: "18px", backgroundColor: "#F01867", borderRadius: "4px" }} />
          </div>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: "68px",
            fontWeight: 900,
            letterSpacing: "-2px",
            marginBottom: "10px",
            color: "#ffffff",
          }}
        >
          StreamView
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#F4C542",
            marginBottom: "24px",
          }}
        >
          Watch Multiple Kick Streams Together
        </div>

        {/* Dedication Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "9999px",
            backgroundColor: "rgba(244, 197, 66, 0.15)",
            border: "1px solid rgba(244, 197, 66, 0.5)",
            fontSize: "20px",
            fontWeight: 600,
            color: "#F4C542",
          }}
        >
          <span>Dedicated to the Yatra RP Community ❤️</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
