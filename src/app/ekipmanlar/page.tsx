import type { Metadata } from "next";
import EquipmentContent from "./EquipmentContent";

export const metadata: Metadata = {
  title: "Ekipman Arşivi | Sunline Studio - İzmir Premium Backline & Stüdyo Envanteri",
  description:
    "Sunline Studio'nun dünya standartlarındaki premium ekipman envanteri. DW Collector's, Pearl Reference, Nord Stage 3, Yamaha Montage, Kemper, Neve 1073DPA ve daha fazlası. İzmir'in en kapsamlı backline ve stüdyo ekipman arşivi.",
  openGraph: {
    title: "Ekipman Arşivi | Sunline Studio",
    description:
      "İzmir'in en geniş premium backline ve stüdyo ekipman envanteri. Davul, perküsyon, klavye, gitar, amfi ve stüdyo ekipmanları.",
  },
};

export default function EquipmentPage() {
  return <EquipmentContent />;
}
