"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { EkipmanAtamaFormu, OdaAtamaFormu, EkipAtamaFormu, AtamaSilButonu } from "./detay-client";

export function DetayAtamaModallari({
  isId,
  isEkipman,
  isOda,
  isEkip,
  envanterListesi,
  odaListesi,
  ekipListesi,
}: {
  isId: string;
  isEkipman: any[];
  isOda: any[];
  isEkip: any[];
  envanterListesi: any[];
  odaListesi: any[];
  ekipListesi: any[];
}) {
  const [modal, setModal] = useState<"ekipman" | "oda" | "ekip" | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="font-semibold">Ekipmanlar</h3>
          <button onClick={() => setModal("ekipman")} className="btn-ghost btn-sm px-2"><Plus size={16} /></button>
        </div>
        <div className="p-4">
          {isEkipman.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">Ekipman atanmamış</p>
          ) : (
            <ul className="space-y-2">
              {isEkipman.map(ie => (
                <li key={ie.id} className="flex justify-between items-center text-sm p-2 bg-stone-50 rounded">
                  <span>{ie.envanter?.ad} <span className="text-stone-400">x{ie.adet}</span></span>
                  <AtamaSilButonu id={ie.id} tip="ekipman" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="font-semibold">Odalar</h3>
          <button onClick={() => setModal("oda")} className="btn-ghost btn-sm px-2"><Plus size={16} /></button>
        </div>
        <div className="p-4">
          {isOda.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">Oda atanmamış</p>
          ) : (
            <ul className="space-y-2">
              {isOda.map(io => (
                <li key={io.id} className="flex justify-between items-center text-sm p-2 bg-stone-50 rounded">
                  <span>{io.studyo_oda?.ad}</span>
                  <AtamaSilButonu id={io.id} tip="oda" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <h3 className="font-semibold">Ekip</h3>
          <button onClick={() => setModal("ekip")} className="btn-ghost btn-sm px-2"><Plus size={16} /></button>
        </div>
        <div className="p-4">
          {isEkip.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">Ekip atanmamış</p>
          ) : (
            <ul className="space-y-2">
              {isEkip.map(ie => (
                <li key={ie.id} className="flex justify-between items-center text-sm p-2 bg-stone-50 rounded">
                  <span>{ie.ekip?.ad} <span className="text-stone-400">({ie.rol || ie.ekip?.uzmanlik || "Genel"})</span></span>
                  <AtamaSilButonu id={ie.id} tip="ekip" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modal === "ekipman" && <EkipmanAtamaFormu isId={isId} envanterListesi={envanterListesi} onClose={() => setModal(null)} />}
      {modal === "oda" && <OdaAtamaFormu isId={isId} odaListesi={odaListesi} onClose={() => setModal(null)} />}
      {modal === "ekip" && <EkipAtamaFormu isId={isId} ekipListesi={ekipListesi} onClose={() => setModal(null)} />}
    </div>
  );
}
