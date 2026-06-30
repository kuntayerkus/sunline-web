import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sunline Yönetim",
    short_name: "Sunline",
    description: "Backline & stüdyo yönetim paneli",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#141414",
    lang: "tr",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
