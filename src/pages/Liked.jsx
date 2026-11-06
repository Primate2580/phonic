import { useMemo } from "react";
import { Heart, Pause, Play } from "lucide-react";
import TrackRow from "../components/TrackRow";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

export default function Liked() {
  const { likes, ready } = useLibrary();
  const { songs, songsLoading, currentSong, isPlaying, play } = usePlayer();

  const liked = useMemo(
    () => likes.map((l) => songs.find((s) => s.id === (l.songId || l.id))).filter(Boolean),
    [likes, songs],
  );

  const playingFromHere = isPlaying && liked.some((s) => s.id === currentSong?.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end gap-6">
        <div className="grid h-32 w-32 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marigold-500 to-hibiscus-400 text-plum-950 shadow-xl shadow-black/40 sm:h-40 sm:w-40">
          <Heart className="h-1/3 w-1/3" fill="currentColor" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Liked songs</h1>
          <p className="mt-2 text-sand-300">
            {liked.length} {liked.length === 1 ? "track" : "tracks"}
          </p>
          {liked.length > 0 && (
            <button
              type="button"
              onClick={() => (playingFromHere ? play(currentSong.id) : play(liked[0].id, liked))}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
            >
              {playingFromHere ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
              {playingFromHere ? "Pause" : "Play all"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-10">
        {!ready || songsLoading ? (
          <p className="text-sand-300">Loading…</p>
        ) : liked.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-plum-600 p-10 text-center">
            <p className="font-display text-lg font-semibold">No liked songs yet</p>
            <p className="mt-2 text-sand-300">Tap the heart on any track and it will be saved here.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {liked.map((song) => (
              <TrackRow
                key={song.id}
                song={song}
                isCurrent={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onPlay={(s) => play(s.id, liked)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
