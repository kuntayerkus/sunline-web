import { ImageResponse } from "next/og";

// Sosyal paylaşım kartı (Open Graph / Twitter) — markaya uygun, dinamik üretilir.
export const runtime = "edge";
export const alt = "Sunline — İzmir Premium Kayıt Stüdyosu ve Backline Kiralama";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#141414",
          color: "#F4F1E8",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              background: "#FF4A1E",
            }}
          />
          <div
            style={{
              fontSize: "30px",
              letterSpacing: "8px",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            İzmir · Alsancak
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "150px",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-6px",
            }}
          >
            SUNLINE
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              marginTop: "24px",
              color: "#FF4A1E",
            }}
          >
            Premium Kayıt Stüdyosu & Backline Kiralama
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "28px" }}>
          <span style={{ color: "#2733E6", fontWeight: 700 }}>BACKLINE</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontWeight: 700 }}>KAYIT</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontWeight: 700 }}>MIX & MASTER</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ fontWeight: 700 }}>PROVA</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
