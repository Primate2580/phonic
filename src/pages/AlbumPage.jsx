import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import Cover from "../components/Cover";
import TrackRow from "../components/TrackRow";
import { usePlayer } from "../context/PlayerContext";
import { artistPath, coverSong, norm } from "../lib/catalog";

export default function AlbumPage() {
  const { artist: rawArtist, album: rawAlbum } = useParams();
  const wantedArtist = decodeURIComponent(rawArtist || "");
  const wantedAlbum = decodeURIComponent(rawAlbum || "");
  const { songs, songsLoading, currentSong, isPlaying, play } = usePlayer();

  // Songs are stored newest first; an album reads better in the order it was uploaded.
  const tracks = useMemo(
    () =>
      songs
        .filter((s) => norm(s.artist) === norm(wantedArtist) && norm(s.album) === norm(wantedAlbum))
        .reverse(),
    [songs, wantedArtist, wantedAlbum],
  );
  const playingFromHere = isPlaying && tracks.some((s) => s.id === currentSong?.id);

  if (songsLoading) return <p className="px-8 py-10 text-sand-300">Loading…</p>;

  if (tracks.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Album not found</h1>
        <p className="mt-3 text-sand-300">It may have been removed.</p>
        <Link to="/browse" className="mt-6 inline-block font-semibold text-marigold-400 hover:text-marigold-300">Back to browse</Link>
      </div>
    );
  }

  const title = tracks[0].album.trim();
  const artist = tracks[0].artist.trim();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end gap-6">
        <Cover song={coverSong(tracks)} className="h-36 w-36 shrink-0 rounded-2xl shadow-xl shadow-black/40 sm:h-44 sm:w-44" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 text-lg">
            <Link to={artistPath(artist)} className="text-sand-300 hover:text-marigold-400 hover:underline">{artist}</Link>
          </p>
          <p className="mt-1 text-sand-500">{tracks.length} {tracks.length === 1 ? "track" : "tracks"}</p>
          <button
            type="button"
            onClick={() => (playingFromHere ? play(currentSong.id) : play(tracks[0].id, tracks))}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
          >
            {playingFromHere ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
            {playingFromHere ? "Pause" : "Play all"}
          </button>
        </div>
      </div>

      <ul className="mt-10 space-y-1">
        {tracks.map((song) => (
          <TrackRow key={song.id} song={song} isCurrent={currentSong?.id === song.id} isPlaying={isPlaying} onPlay={(s) => play(s.id, tracks)} />
        ))}
      </ul>
    </div>
  );
}
