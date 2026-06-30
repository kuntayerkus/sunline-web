import { ImageResponse } from "next/og";

// Sosyal paylaşım kartı (Open Graph / Twitter) — markaya uygun, dinamik üretilir.
// Brand kit: yalnız Paper/Ink/Flare/Volt; güneş/daire klişesi YOK;
// imza = kelime markasından hemen sonra Volt kare blok.
export const runtime = "edge";
export const alt = "Sunline — İzmir Premium Kayıt Stüdyosu ve Backline Kiralama";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F4F1E8";
const INK = "#141414";
const FLARE = "#FF4A1E";
const VOLT = "#2733E6";

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
          background: INK,
          color: PAPER,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Üst: Volt kare imza + konum */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "22px", height: "22px", background: VOLT }} />
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

        {/* Kelime markası + Volt kare blok (imprint) */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
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
                width: "34px",
                height: "34px",
                background: VOLT,
                marginLeft: "14px",
                marginBottom: "18px",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "40px",
              fontWeight: 700,
              marginTop: "24px",
              color: FLARE,
            }}
          >
            Premium Kayıt Stüdyosu & Backline Kiralama
          </div>
        </div>

        {/* Alt: hizmet hatları */}
        <div style={{ display: "flex", gap: "16px", fontSize: "28px" }}>
          <span style={{ color: VOLT, fontWeight: 700 }}>BACKLINE</span>
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
