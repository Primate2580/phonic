import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Pause, Play, Plus } from "lucide-react";
import Cover from "../components/Cover";
import EpisodeRow from "../components/EpisodeRow";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";

export default function ShowDetail() {
  const { showId } = useParams();
  const { showsById, episodes, ready, followedIds, toggleFollow } = usePodcasts();
  const { currentSong, isPlaying, play } = usePlayer();

  const show = showsById.get(showId);
  const eps = useMemo(() => episodes.filter((e) => e.showId === showId), [episodes, showId]);

  if (!ready) return <p className="px-8 py-10 text-sand-300">Loading…</p>;

  if (!show) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Show not found</h1>
        <p className="mt-3 text-sand-300">It may have been removed.</p>
        <Link to="/podcasts" className="mt-6 inline-block font-semibold text-marigold-400 hover:text-marigold-300">Back to podcasts</Link>
      </div>
    );
  }

  const following = followedIds.has(show.id);
  const playingFromHere = isPlaying && eps.some((e) => e.id === currentSong?.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end gap-6">
        <Cover song={{ title: show.title, coverURL: show.coverURL }} className="h-36 w-36 shrink-0 rounded-2xl shadow-xl shadow-black/40 sm:h-44 sm:w-44" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight md:text-4xl">{show.title}</h1>
          <p className="mt-2 text-lg text-sand-300">{show.host}</p>
          {show.category && (
            <Link to={`/browse/podcasts/${encodeURIComponent(show.category)}`} className="mt-2 inline-block rounded-full bg-plum-800 px-3 py-1 text-sm text-sand-300 hover:text-marigold-400">
              {show.category}
            </Link>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {eps.length > 0 && (
              <button
                type="button"
                onClick={() => (playingFromHere ? play(currentSong.id) : play(eps[0].id, eps))}
                className="inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
              >
                {playingFromHere ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
                {playingFromHere ? "Pause" : "Play latest"}
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleFollow(show.id)}
              aria-pressed={following}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                following ? "border-marigold-400 text-marigold-400" : "border-plum-600 hover:border-sand-500"
              }`}
            >
              {following ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {following ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {show.description && <p className="mt-8 max-w-2xl whitespace-pre-line text-sand-300">{show.description}</p>}

      <h2 className="mt-10 font-display text-xl font-semibold">
        Episodes <span className="font-sans text-sm font-normal text-sand-500">({eps.length})</span>
      </h2>
      {eps.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-plum-600 p-8 text-center text-sand-300">No episodes yet. Check back soon.</p>
      ) : (
        <ul className="mt-3 divide-y divide-plum-800">
          {eps.map((ep) => (
            <EpisodeRow key={ep.id} episode={ep} isCurrent={currentSong?.id === ep.id} isPlaying={isPlaying} onPlay={(e) => play(e.id, eps)} />
          ))}
        </ul>
      )}
    </div>
  );
}
