export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-baseline gap-[0.15em] ${className}`}>
      <span className="font-display font-black tracking-tighter leading-none text-current">
        SUNLINE
      </span>
      <span className="bg-[var(--color-volt)] block h-[0.25em] w-[0.25em] shrink-0"></span>
    </div>
  );
}

// Named exports for backward compatibility with other pages
export function SunlineMark({ className = "", size }: { className?: string; size?: number }) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <span
      className={`bg-[var(--color-volt)] inline-block shrink-0 ${size ? "" : "h-[0.6em] w-[0.6em]"} ${className}`}
      style={style}
    ></span>
  );
}

export function SunlineLogo({ className = "" }: { className?: string }) {
  return <Logo className={className} />;
}

