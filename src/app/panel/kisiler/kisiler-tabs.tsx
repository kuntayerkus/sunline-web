"use client";

import { useState } from "react";
import { Tabs } from "@/components/tabs";
import type { Musteri, Ekip } from "@/lib/types";
import { MusteriListesi } from "./musteri-client";
import { EkipListesi } from "./ekip-client";

export function KisilerTabs({
  musteriler,
  ekip,
}: {
  musteriler: Musteri[];
  ekip: Ekip[];
}) {
  const [aktifTab, setAktifTab] = useState("musteriler");

  const tabsWithCount = [
    { key: "musteriler", label: "Müşteriler", count: musteriler.length },
    { key: "ekip", label: "Ekip", count: ekip.length },
  ];

  return (
    <>
      <Tabs tabs={tabsWithCount} active={aktifTab} onChange={setAktifTab} />

      {aktifTab === "musteriler" && <MusteriListesi musteriler={musteriler} />}
      {aktifTab === "ekip" && <EkipListesi ekipUyeleri={ekip} />}
    </>
  );
}
