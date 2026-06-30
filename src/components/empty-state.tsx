import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  baslik,
  aciklama,
  children,
}: {
  icon?: LucideIcon;
  baslik: string;
  aciklama?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-stone-100 p-3">
        <Icon size={28} className="text-stone-400" />
      </div>
      <p className="text-sm font-medium text-stone-700">{baslik}</p>
      {aciklama && (
        <p className="max-w-sm text-sm text-stone-400">{aciklama}</p>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
