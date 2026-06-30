"use client";

export type Tab = { key: string; label: string; count?: number };

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-stone-200 mb-5">
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={[
              "relative px-4 py-2.5 text-sm font-medium transition select-none",
              isActive
                ? "text-brand-600"
                : "text-stone-500 hover:text-stone-700",
            ].join(" ")}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={[
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-stone-100 text-stone-500",
                ].join(" ")}
              >
                {t.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
