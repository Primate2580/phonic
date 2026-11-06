import { Link } from "react-router-dom";
import { categoryGradient } from "../lib/categories";

export default function CategoryTile({ to, name, count, unit }) {
  return (
    <Link
      to={to}
      className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-xl p-4 shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5"
      style={{ background: categoryGradient(name) }}
    >
      <span
        className="vinyl pointer-events-none absolute -right-8 -top-8 h-28 w-28 opacity-40 transition-transform duration-500 group-hover:rotate-45"
        aria-hidden="true"
      />
      <span className="relative font-display text-lg font-semibold leading-tight">{name}</span>
      <span className="relative text-sm text-sand-100/70">
        {count} {count === 1 ? unit : `${unit}s`}
      </span>
    </Link>
  );
}
