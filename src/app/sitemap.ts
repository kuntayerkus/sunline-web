import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { gearCategories } from "@/lib/gearData";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const sabit: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/ekipmanlar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const ekipman: MetadataRoute.Sitemap = gearCategories.map((c) => ({
    url: `${SITE_URL}/ekipmanlar/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...sabit, ...ekipman];
}
