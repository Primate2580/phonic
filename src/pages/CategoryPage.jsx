import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import ShowCard from "../components/ShowCard";
import SongCard from "../components/SongCard";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";
import { categoryGradient } from "../lib/categories";

export default function CategoryPage() {
  const { type, category: rawCategory } = useParams();
  const category = decodeURIComponent(rawCategory || "");
  const isMusic = type === "music";

  const { songs, songsLoading, currentSong, isPlaying, play } = usePlayer();
  const { shows, ready } = usePodcasts();

  const items = useMemo(
    () => (isMusic ? songs : shows).filter((x) => (x.category || "").trim() === category),
    [isMusic, songs, shows, category],
  );

  const loading = isMusic ? songsLoading : !ready;
  const playingFromHere = isMusic && isPlaying && items.some((s) => s.id === currentSong?.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="rounded-3xl p-6 md:p-10" style={{ background: categoryGradient(category) }}>
        <Link to="/browse" className="text-sm text-sand-100/70 hover:text-sand-100">Browse</Link>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">{category}</h1>
        <p className="mt-2 text-sand-100/70">
          {items.length} {isMusic ? (items.length === 1 ? "track" : "tracks") : items.length === 1 ? "show" : "shows"}
        </p>
        {isMusic && items.length > 0 && (
          <button
            type="button"
            onClick={() => (playingFromHere ? play(currentSong.id) : play(items[0].id, items))}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
          >
            {playingFromHere ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
            {playingFromHere ? "Pause" : "Play all"}
          </button>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-sand-300">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sand-300">
            Nothing in “{category}” yet.{" "}
            <Link to="/browse" className="font-semibold text-marigold-400 hover:text-marigold-300">Back to browse</Link>
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isMusic
              ? items.map((song) => (
                  <SongCard key={song.id} song={song} isCurrent={currentSong?.id === song.id} isPlaying={isPlaying} onPlay={(id) => play(id, items)} />
                ))
              : items.map((show) => <ShowCard key={show.id} show={show} />)}
          </div>
        )}
      </div>
    </div>
  );
}
