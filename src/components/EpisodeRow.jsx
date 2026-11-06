import { memo } from "react";
import { Link } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { formatDate } from "../lib/format";
import Cover from "./Cover";

function EpisodeRow({ episode, isCurrent, isPlaying, onPlay, showName = false }) {
  const showPause = isCurrent && isPlaying;
  return (
    <li className="group flex items-start gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-plum-800/60 focus-within:bg-plum-800/60">
      <Cover song={episode} className="h-16 w-16 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        {showName && (
          <Link to={`/podcasts/${episode.showId}`} className="block truncate text-xs text-sand-500 hover:text-marigold-400">
            {episode.album}
          </Link>
        )}
        <p className={`font-medium leading-snug ${isCurrent ? "text-marigold-400" : ""}`}>{episode.title}</p>
        {episode.description && <p className="mt-1 line-clamp-2 text-sm text-sand-500">{episode.description}</p>}
        <p className="mt-1 text-xs text-sand-500">{formatDate(episode.publishedAt)}</p>
      </div>
      <button
        type="button"
        onClick={() => onPlay(episode)}
        aria-label={`${showPause ? "Pause" : "Play"} ${episode.title}`}
        className="grid h-11 w-11 shrink-0 place-items-center self-center rounded-full bg-marigold-400 text-plum-950 transition-transform hover:scale-105 hover:bg-marigold-300"
      >
        {showPause ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
      </button>
    </li>
  );
}

export default memo(EpisodeRow);
