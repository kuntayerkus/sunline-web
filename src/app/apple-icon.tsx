import { ImageResponse } from "next/og";

// iOS "Ana ekrana ekle" ikonu.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141414",
          color: "#F4F1E8",
          fontSize: 118,
          fontWeight: 900,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        S
        <div style={{ position: "absolute", right: 32, bottom: 40, width: 20, height: 20, background: "#2733E6" }} />
      </div>
    ),
    { ...size },
  );
}
