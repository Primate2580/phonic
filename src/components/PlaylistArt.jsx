import { Music2 } from "lucide-react";
import Cover from "./Cover";

/** A 2x2 mosaic of the first covers in a playlist (or a placeholder when it's empty). */
export default function PlaylistArt({ songs, className = "" }) {
  const tiles = songs.slice(0, 4);
  if (tiles.length === 0) {
    return (
      <div className={`grid place-items-center bg-plum-800 text-sand-500 ${className}`}>
        <Music2 className="h-1/3 w-1/3" aria-hidden="true" />
      </div>
    );
  }
  if (tiles.length < 4) {
    return <Cover song={tiles[0]} className={className} />;
  }
  return (
    <div className={`grid grid-cols-2 grid-rows-2 overflow-hidden ${className}`}>
      {tiles.map((s) => (
        <Cover key={s.id} song={s} className="h-full w-full" />
      ))}
    </div>
  );
}
