"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { Profile } from "@/lib/types";
import { tarihKisa } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { rolGuncelle } from "./actions";

export function AyarlarClient({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [rolDegisimOnay, setRolDegisimOnay] = useState<{ id: string, yeniRol: string } | null>(null);

  async function handleRolDegistir() {
    if (!rolDegisimOnay) return;
    setLoading(true);
    await rolGuncelle(rolDegisimOnay.id, rolDegisimOnay.yeniRol);
    setLoading(false);
    setRolDegisimOnay(null);
  }

  return (
    <div>
      <div className="card">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-semibold">Kullanıcılar</h3>
        </div>

        {profiles.length === 0 ? (
          <EmptyState icon={Users} baslik="Kullanıcı bulunamadı" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Ad Soyad</th>
                <th>Kayıt Tarihi</th>
                <th>Rol</th>
                <th className="w-[100px]">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const isMe = p.id === currentUserId;
                const digerRol = p.rol === "patron" ? "ekip" : "patron";
                return (
                  <tr key={p.id} className={isMe ? "bg-brand-50/30" : ""}>
                    <td className="font-medium">
                      {p.ad_soyad || "İsimsiz"}
                      {isMe && <span className="ml-2 text-xs text-brand-600 bg-brand-100 px-1.5 py-0.5 rounded-full">Sen</span>}
                    </td>
                    <td>{tarihKisa(p.created_at)}</td>
                    <td>
                      <span className={`badge ${p.rol === "patron" ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"}`}>
                        {p.rol}
                      </span>
                    </td>
                    <td>
                      {!isMe && (
                        <button
                          type="button"
                          onClick={() => setRolDegisimOnay({ id: p.id, yeniRol: digerRol })}
                          disabled={loading}
                          className="btn-outline btn-sm text-xs px-2"
                        >
                          {digerRol === "patron" ? "Patron Yap" : "Ekip Yap"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!rolDegisimOnay}
        onClose={() => setRolDegisimOnay(null)}
        onConfirm={handleRolDegistir}
        baslik="Rol Değişikliği Onayı"
        mesaj={`Bu kullanıcının rolünü "${rolDegisimOnay?.yeniRol}" olarak değiştirmek istediğinize emin misiniz?`}
        onayLabel="Değiştir"
        tehlikeli={false}
      />
    </div>
  );
}
