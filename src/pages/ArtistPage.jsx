import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import { AlbumCard } from "../components/MusicCards";
import PlaylistArt from "../components/PlaylistArt";
import TrackRow from "../components/TrackRow";
import { usePlayer } from "../context/PlayerContext";
import { groupAlbums, norm } from "../lib/catalog";

export default function ArtistPage() {
  const { artist: raw } = useParams();
  const wanted = decodeURIComponent(raw || "");
  const { songs, songsLoading, currentSong, isPlaying, play } = usePlayer();

  const tracks = useMemo(() => songs.filter((s) => norm(s.artist) === norm(wanted)), [songs, wanted]);
  const albums = useMemo(() => groupAlbums(tracks), [tracks]);
  const name = tracks[0]?.artist?.trim() || wanted;
  const playingFromHere = isPlaying && tracks.some((s) => s.id === currentSong?.id);

  if (songsLoading) return <p className="px-8 py-10 text-sand-300">Loading…</p>;

  if (tracks.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Artist not found</h1>
        <p className="mt-3 text-sand-300">There are no tracks by “{wanted}” in the library.</p>
        <Link to="/browse" className="mt-6 inline-block font-semibold text-marigold-400 hover:text-marigold-300">Back to browse</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end gap-6">
        <PlaylistArt songs={tracks} className="h-36 w-36 shrink-0 rounded-full shadow-xl shadow-black/40 sm:h-44 sm:w-44" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight md:text-5xl">{name}</h1>
          <p className="mt-2 text-sand-300">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            {albums.length > 0 && `, ${albums.length} ${albums.length === 1 ? "album" : "albums"}`}
          </p>
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

      <section className="mt-10" aria-labelledby="artist-songs">
        <h2 id="artist-songs" className="font-display text-xl font-semibold">Songs</h2>
        <ul className="mt-3 space-y-1">
          {tracks.map((song) => (
            <TrackRow key={song.id} song={song} isCurrent={currentSong?.id === song.id} isPlaying={isPlaying} onPlay={(s) => play(s.id, tracks)} />
          ))}
        </ul>
      </section>

      {albums.length > 0 && (
        <section className="mt-12" aria-labelledby="artist-albums">
          <h2 id="artist-albums" className="font-display text-xl font-semibold">Albums</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard key={album.key} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
