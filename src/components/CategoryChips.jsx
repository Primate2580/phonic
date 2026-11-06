/** A row of filter pills. `value` is "" for All. */
export default function CategoryChips({ categories, value, onChange, label = "Filter by category" }) {
  if (categories.length === 0) return null;
  const items = ["", ...categories];
  return (
    <div role="group" aria-label={label} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
      {items.map((c) => {
        const active = value === c;
        return (
          <button
            key={c || "all"}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-marigold-400 text-plum-950" : "bg-plum-800 text-sand-300 hover:bg-plum-700 hover:text-sand-100"
            }`}
          >
            {c || "All"}
          </button>
        );
      })}
    </div>
  );
}
