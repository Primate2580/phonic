import { useMemo, useState } from "react";
import CategoryChips from "../components/CategoryChips";
import ContinueListening from "../components/ContinueListening";
import EpisodeRow from "../components/EpisodeRow";
import ShowCard from "../components/ShowCard";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";

export default function Podcasts() {
  const { shows, episodes, ready, error, progressById } = usePodcasts();
  const { currentSong, isPlaying, play } = usePlayer();
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(shows.map((s) => (s.category || "").trim()).filter(Boolean))].sort(),
    [shows],
  );
  const visibleShows = category ? shows.filter((s) => (s.category || "").trim() === category) : shows;
  const latest = useMemo(() => episodes.slice(0, 5), [episodes]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Podcasts</h1>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-hibiscus-400/40 bg-hibiscus-400/10 p-4 text-hibiscus-400">{error}</p>
      )}

      {!ready ? (
        <p className="mt-8 text-sand-300">Loading…</p>
      ) : shows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-plum-600 p-10 text-center">
          <p className="font-display text-lg font-semibold">No podcasts yet</p>
          <p className="mt-2 text-sand-300">Shows will appear here as soon as they're published. Check back soon.</p>
        </div>
      ) : (
        <>
          <ContinueListening className="mt-8" />
          {latest.length > 0 && (
            <section className="mt-8" aria-labelledby="latest-eps">
              <h2 id="latest-eps" className="font-display text-xl font-semibold">New episodes</h2>
              <ul className="mt-3 divide-y divide-plum-800">
                {latest.map((ep) => (
                  <EpisodeRow
                    key={ep.id}
                    episode={ep}
                    progress={progressById.get(ep.rawId)}
                    showName
                    isCurrent={currentSong?.id === ep.id}
                    isPlaying={isPlaying}
                    onPlay={(e) => play(e.id, latest)}
                  />
                ))}
              </ul>
            </section>
          )}

          <section className="mt-12" aria-labelledby="all-shows">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="all-shows" className="font-display text-xl font-semibold">All shows</h2>
            </div>
            <div className="mt-4">
              <CategoryChips categories={categories} value={category} onChange={setCategory} label="Filter shows by category" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
