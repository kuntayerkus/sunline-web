// Sayfa segmenti yüklenirken anında gösterilir (Suspense). Geçiş "anlık" hissettirir.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Başlık */}
      <div className="space-y-2">
        <div className="h-7 w-44 rounded-lg bg-stone-200" />
        <div className="h-4 w-64 rounded bg-stone-100" />
      </div>

      {/* İstatistik / özet kartları */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-stone-200/70" />
        ))}
      </div>

      {/* İçerik blokları */}
      <div className="h-40 rounded-xl bg-stone-200/60" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-stone-200/50" />
        ))}
      </div>
    </div>
  );
}
