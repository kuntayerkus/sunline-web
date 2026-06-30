import { ImageResponse } from "next/og";

// Favicon / genel uygulama ikonu.
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 168,
          fontWeight: 900,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        S
        <div style={{ position: "absolute", right: 46, bottom: 58, width: 28, height: 28, background: "#2733E6" }} />
      </div>
    ),
    { ...size },
  );
}
