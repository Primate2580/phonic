import { memo } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, X } from "lucide-react";
import { albumPath, artistPath } from "../lib/catalog";
import Cover from "./Cover";
import { AddToPlaylistButton, LikeButton } from "./TrackActions";

const linkClass = "truncate hover:text-marigold-400 hover:underline";

function TrackRow({ song, isCurrent, isPlaying, onPlay, onRemove, removeLabel = "Remove" }) {
  const showPause = isCurrent && isPlaying;
  return (
    <li className="group flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-plum-800/60 focus-within:bg-plum-800/60">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          onClick={() => onPlay(song)}
          aria-label={`${showPause ? "Pause" : "Play"} ${song.title} by ${song.artist}`}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md"
        >
          <Cover song={song} className="h-full w-full" />
          <span
            className={`absolute inset-0 grid place-items-center bg-plum-950/60 text-marigold-400 transition-opacity ${
              isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
          >
            {showPause ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onPlay(song)}
            className={`block max-w-full truncate text-left font-medium ${isCurrent ? "text-marigold-400" : ""}`}
          >
            {song.title}
          </button>
          <Link to={artistPath(song.artist)} className={`block text-sm text-sand-500 ${linkClass}`}>
            {song.artist}
          </Link>
        </div>

        {song.album && (
          <Link to={albumPath(song.artist, song.album)} className={`hidden w-1/4 text-sm text-sand-500 lg:block ${linkClass}`}>
            {song.album}
          </Link>
        )}
      </div>

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
