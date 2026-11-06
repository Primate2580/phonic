import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Search } from "lucide-react";
import CategoryChips from "../components/CategoryChips";
import Cover from "../components/Cover";
import SongCard from "../components/SongCard";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { greeting } from "../lib/format";

/** A sleeve with a record sliding out of it. The record spins while music plays. */
function NowSpinning({ song, isCurrent, isPlaying, onPlay }) {
  const active = isCurrent && isPlaying;
  return (
    <section className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10" aria-label="Featured track">
      <div className="relative h-[var(--s)] w-[calc(var(--s)*1.6)] shrink-0 [--s:10.5rem] sm:[--s:13rem]">
        <div
          className={`vinyl absolute left-0 top-0 h-[var(--s)] w-[var(--s)] transition-transform duration-700 ease-out ${active ? "translate-x-[60%]" : "translate-x-[44%]"}`}
        >
          <div className={`spin h-full w-full rounded-full ${active ? "" : "is-paused"}`}>
            <Cover
              song={song}
              className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-marigold-400"
            />
            <div className="absolute left-1/2 top-1/2 h-[4%] w-[4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum-950" />
          </div>
        </div>
        <Cover song={song} className="relative z-10 h-[var(--s)] w-[var(--s)] rounded-md shadow-2xl shadow-black/60" />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-sand-500">{isCurrent ? (isPlaying ? "Playing now" : "Paused") : "Newest in the library"}</p>
        <h2 className="mt-1 break-words font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{song.title}</h2>
        <p className="mt-2 text-lg text-sand-300">
          {song.artist}
          {song.album ? <span className="text-sand-500"> on {song.album}</span> : null}
        </p>
        <button
          type="button"
          onClick={() => onPlay(song.id)}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
        >
          {active ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
          {active ? "Pause" : isCurrent ? "Resume" : "Play"}
        </button>
      </div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square rounded-md bg-plum-800" />
          <div className="mt-3 h-3 w-3/4 rounded bg-plum-800" />
          <div className="mt-2 h-3 w-1/2 rounded bg-plum-800/70" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { displayName, isAdmin } = useAuth();
  const { songs, songsLoading, songsError, currentSong, isPlaying, play } = usePlayer();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(songs.map((s) => (s.category || "").trim()).filter(Boolean))].sort(),
    [songs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs.filter(
      (s) =>
        (!category || (s.category || "").trim() === category) &&
        (!q || [s.title, s.artist, s.album].some((field) => (field || "").toLowerCase().includes(q))),
    );
  }, [songs, query, category]);

  const featured = currentSong || songs[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
        {greeting()}, {displayName}
      </h1>

      {featured && !songsError && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-plum-800 to-plum-900 p-6 md:p-10">
          <NowSpinning song={featured} isCurrent={currentSong?.id === featured.id} isPlaying={isPlaying} onPlay={play} />
        </div>
      )}

      <section className="mt-12" aria-labelledby="library-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="library-title" className="font-display text-xl font-semibold">
            Library
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, artist or album"
              aria-label="Search the library"
              className="w-full rounded-full border border-plum-700 bg-plum-900 py-2.5 pl-10 pr-4 text-sm placeholder-sand-500 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <CategoryChips categories={categories} value={category} onChange={setCategory} label="Filter songs by category" />
        </div>

        <div className="mt-6">
          {songsLoading ? (
            <SkeletonGrid />
          ) : songsError ? (
            <p role="alert" className="rounded-xl border border-hibiscus-400/40 bg-hibiscus-400/10 p-5 text-hibiscus-400">
              {songsError}
            </p>
          ) : songs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-plum-600 p-10 text-center">
              <p className="font-display text-lg font-semibold">The library is empty</p>
              <p className="mt-2 text-sand-300">
                {isAdmin ? (
                  <>
                    Upload the first track from{" "}
                    <Link to="/admin" className="font-semibold text-marigold-400 hover:text-marigold-300">
                      Manage content
                    </Link>
                    .
                  </>
                ) : (
                  "Tracks will show up here as soon as they're published. Check back soon."
                )}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sand-300">
              Nothing matches{query ? ` “${query}”` : ""}{category ? ` in ${category}` : ""}. Try a different search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isCurrent={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  onPlay={play}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
