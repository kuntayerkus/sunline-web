import type { Metadata } from "next";
import { gearData } from "@/lib/gearData";
import GearDetailContent from "./GearDetailContent";

type Props = {
  params: Promise<{ slug: string }>;
};

// Tüm ekipman kategorilerini build sırasında statik üret (SSG).
export function generateStaticParams() {
  return Object.keys(gearData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = gearData[slug];

  if (!data) {
    return {
      title: "Kategori Bulunamadı | Sunline Studio",
    };
  }

  return {
    title: `${data.title} | Sunline Studio - İzmir Premium Ekipman Envanteri`,
    description: `Sunline Studio ${data.title} envanteri: ${data.items.slice(0, 5).join(", ")} ve daha fazlası. İzmir'in en kapsamlı premium backline koleksiyonu.`,
    openGraph: {
      title: `${data.title} | Sunline Studio`,
      description: `${data.title} kategorisindeki premium ekipmanlarımız. İzmir backline kiralama ve stüdyo hizmetleri.`,
    },
  };
}

export default async function GearDetailPage({ params }: Props) {
  const { slug } = await params;
  return <GearDetailContent slug={slug} />;
}
