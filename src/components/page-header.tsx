export function PageHeader({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          {baslik}
        </h1>
        {aciklama && <p className="mt-1 text-sm text-stone-500">{aciklama}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function YapimAsamasi({ ad }: { ad: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <p className="text-sm font-medium text-stone-600">
        {ad} modülü birazdan burada olacak.
      </p>
      <p className="text-sm text-stone-400">
        Temel altyapı kuruldu; bu bölüm sıradaki adımlarda eklenecek.
      </p>
    </div>
  );
}
