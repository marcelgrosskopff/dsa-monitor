import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#0A0E1A",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 20, height: 20, background: "#CA0013" }} />
          <span
            style={{
              color: "#FFFFFF",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            DSA Monitor
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p
            style={{
              color: "#FFFFFF",
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 820,
            }}
          >
            Independent DSA compliance research.
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 24,
              margin: 0,
              maxWidth: 680,
              lineHeight: 1.5,
            }}
          >
            Methodology-first studies on very large online platforms. Published by OIAT.
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>
            dsa-monitor.at
          </span>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#CA0013",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }}>
            Funded by netidee
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
