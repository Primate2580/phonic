import { memo } from "react";
import { Link } from "react-router-dom";
import { Check, Pause, Play } from "lucide-react";
import { formatDate } from "../lib/format";
import Cover from "./Cover";

function minutesLeft(progress) {
  if (!progress?.duration) return "";
  const mins = Math.max(1, Math.ceil((progress.duration - progress.position) / 60));
  return mins >= 60 ? `${Math.floor(mins / 60)} hr ${mins % 60} min left` : `${mins} min left`;
}

function EpisodeRow({ episode, isCurrent, isPlaying, onPlay, showName = false, progress }) {
  const showPause = isCurrent && isPlaying;
  const resumable = progress && !progress.completed && progress.position > 5 && progress.duration > 0;
  const pct = resumable ? Math.min(100, (progress.position / progress.duration) * 100) : 0;
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
        {resumable && (
          <div className="mt-2 flex items-center gap-3">
            <div
              className="h-1 w-28 overflow-hidden rounded-full bg-plum-700"
              role="progressbar"
              aria-label="Listening progress"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full bg-marigold-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-sand-500">{minutesLeft(progress)}</span>
          </div>
        )}
        {progress?.completed && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-sand-500">
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Played
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onPlay(episode)}
        aria-label={`${showPause ? "Pause" : resumable ? "Resume" : "Play"} ${episode.title}`}
        className="grid h-11 w-11 shrink-0 place-items-center self-center rounded-full bg-marigold-400 text-plum-950 transition-transform hover:scale-105 hover:bg-marigold-300"
      >
        {showPause ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
      </button>
    </li>
  );
}

export default memo(EpisodeRow);
