import { memo } from "react";
import { Pause, Play } from "lucide-react";
import Cover from "./Cover";

function SongCard({ song, isCurrent, isPlaying, onPlay }) {
  const showPause = isCurrent && isPlaying;
  return (
    <button
      type="button"
      onClick={() => onPlay(song.id)}
      aria-label={`${showPause ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
      className="group block w-full text-left"
    >
      <div
        className={`relative aspect-square overflow-hidden rounded-md shadow-lg shadow-black/40 ${
          isCurrent ? "ring-2 ring-marigold-400 ring-offset-2 ring-offset-plum-950" : ""
        }`}
      >
        <Cover song={song} className="h-full w-full" />
        <div
          className={`absolute inset-0 grid place-items-center bg-plum-950/50 transition-opacity ${
            isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-marigold-400 text-plum-950 transition-transform group-hover:scale-105">
            {showPause ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${isCurrent ? "text-marigold-400" : ""}`}>{song.title}</p>
          <p className="truncate text-sm text-sand-500">{song.artist}</p>
        </div>
        {isCurrent && (
          <span className={`eq mt-1 text-marigold-400 ${isPlaying ? "" : "is-paused"}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
      </div>
    </button>
  );
}

export default memo(SongCard);
