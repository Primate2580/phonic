import { Link } from "react-router-dom";
import Cover from "./Cover";

export default function ShowCard({ show }) {
  return (
    <Link to={`/podcasts/${show.id}`} className="group block">
      <Cover
        song={{ title: show.title, coverURL: show.coverURL }}
        className="aspect-square w-full rounded-xl shadow-lg shadow-black/40 transition-transform group-hover:-translate-y-0.5"
      />
      <p className="mt-3 truncate text-sm font-semibold group-hover:text-marigold-400">{show.title}</p>
      <p className="truncate text-sm text-sand-500">{show.host}</p>
    </Link>
  );
}
