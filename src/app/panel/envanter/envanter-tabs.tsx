"use client";

import { useState } from "react";
import { Tabs } from "@/components/tabs";
import type { Envanter, StudyoOda, Hizmet } from "@/lib/types";
import { EnvanterSayfasi } from "./envanter-client";
import { OdaSayfasi } from "./oda-client";
import { HizmetSayfasi } from "./hizmet-client";

export function EnvanterTabs({
  ekipmanlar,
  odalar,
  hizmetler,
}: {
  ekipmanlar: Envanter[];
  odalar: StudyoOda[];
  hizmetler: Hizmet[];
}) {
  const [aktifTab, setAktifTab] = useState("ekipman");

  const tabsWithCount = [
    { key: "ekipman", label: "Ekipman", count: ekipmanlar.length },
    { key: "oda", label: "Stüdyo Odaları", count: odalar.length },
    { key: "hizmet", label: "Hizmetler", count: hizmetler.length },
  ];

  return (
    <>
      <Tabs tabs={tabsWithCount} active={aktifTab} onChange={setAktifTab} />

      {aktifTab === "ekipman" && <EnvanterSayfasi ekipmanlar={ekipmanlar} />}
      {aktifTab === "oda" && <OdaSayfasi odalar={odalar} />}
      {aktifTab === "hizmet" && <HizmetSayfasi hizmetler={hizmetler} />}
    </>
  );
}
