export default function Logo({ size = "md", compact = false }) {
  const dims = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const text = size === "lg" ? "text-3xl" : "text-xl";
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className={dims} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#2a1a39" />
        <circle cx="32" cy="32" r="21" fill="none" stroke="#503868" strokeWidth="2" />
        <circle cx="32" cy="32" r="12" fill="none" stroke="#3b2850" strokeWidth="2" />
        <circle cx="32" cy="32" r="7" fill="#f6b93b" />
        <circle cx="32" cy="32" r="1.8" fill="#150c1d" />
      </svg>
      <span className={compact ? "sr-only" : `font-display font-semibold tracking-tight ${text}`}>Phonic</span>
    </span>
  );
}
