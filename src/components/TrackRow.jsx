import { memo } from "react";
import { Pause, Play, X } from "lucide-react";
import Cover from "./Cover";
import { AddToPlaylistButton, LikeButton } from "./TrackActions";

function TrackRow({ song, isCurrent, isPlaying, onPlay, onRemove, removeLabel = "Remove" }) {
  const showPause = isCurrent && isPlaying;
  return (
    <li className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-plum-800/60 focus-within:bg-plum-800/60">
      <button
        type="button"
        onClick={() => onPlay(song)}
        aria-label={`${showPause ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          <Cover song={song} className="h-full w-full" />
          <span
            className={`absolute inset-0 grid place-items-center bg-plum-950/60 text-marigold-400 transition-opacity ${
              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            {showPause ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-medium ${isCurrent ? "text-marigold-400" : ""}`}>{song.title}</span>
          <span className="block truncate text-sm text-sand-500">{song.artist}</span>
        </span>
        {song.album && <span className="hidden w-1/4 truncate text-sm text-sand-500 lg:block">{song.album}</span>}
      </button>

      <LikeButton songId={song.id} title={song.title} />
      <AddToPlaylistButton song={song} />
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(song)}
          aria-label={`${removeLabel} ${song.title}`}
          title={removeLabel}
          className="grid h-9 w-9 place-items-center rounded-full text-sand-500 transition-colors hover:bg-hibiscus-400/10 hover:text-hibiscus-400"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </li>
  );
}

export default memo(TrackRow);
