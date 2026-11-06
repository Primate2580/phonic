import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Pause, Pencil, Play, Trash2 } from "lucide-react";
import PlaylistArt from "../components/PlaylistArt";
import TrackRow from "../components/TrackRow";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { playlists, ready, renamePlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
  const { songs, songsLoading, currentSong, isPlaying, play } = usePlayer();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const playlist = playlists.find((p) => p.id === playlistId);
  const tracks = useMemo(
    () => (playlist?.songIds || []).map((id) => songs.find((s) => s.id === id)).filter(Boolean),
    [playlist, songs],
  );

  if (!ready || songsLoading) {
    return <p className="px-8 py-10 text-sand-300">Loading…</p>;
  }

  if (!playlist) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Playlist not found</h1>
        <p className="mt-3 text-sand-300">It may have been deleted.</p>
        <Link to="/playlists" className="mt-6 inline-block font-semibold text-marigold-400 hover:text-marigold-300">
          Back to playlists
        </Link>
      </div>
    );
  }

  const playingFromHere = isPlaying && tracks.some((s) => s.id === currentSong?.id);

  async function saveName(e) {
    e.preventDefault();
    if (draft.trim() && draft.trim() !== playlist.name) {
      try {
        await renamePlaylist(playlist.id, draft);
      } catch (err) {
        console.error(err);
      }
    }
    setEditing(false);
  }

  async function remove() {
    if (!window.confirm(`Delete the playlist “${playlist.name}”? The songs themselves stay in the library.`)) return;
    try {
      await deletePlaylist(playlist.id);
      navigate("/playlists", { replace: true });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-end gap-6">
        <PlaylistArt songs={tracks} className="h-32 w-32 shrink-0 rounded-2xl shadow-xl shadow-black/40 sm:h-40 sm:w-40" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <form onSubmit={saveName} className="flex items-center gap-2">
              <label htmlFor="rename" className="sr-only">Playlist name</label>
              <input
                id="rename"
                autoFocus
                value={draft}
                maxLength={60}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
                className="min-w-0 flex-1 rounded-lg border border-plum-600 bg-plum-950 px-3 py-2 font-display text-2xl font-semibold focus:border-marigold-400 focus:outline-none"
              />
              <button type="submit" aria-label="Save name" className="grid h-10 w-10 place-items-center rounded-full bg-marigold-400 text-plum-950 hover:bg-marigold-300">
                <Check className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <h1 className="break-words font-display text-3xl font-semibold tracking-tight md:text-4xl">{playlist.name}</h1>
          )}
          <p className="mt-2 text-sand-300">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {tracks.length > 0 && (
              <button
                type="button"
                onClick={() => (playingFromHere ? play(currentSong.id) : play(tracks[0].id, tracks))}
                className="inline-flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
              >
                {playingFromHere ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5" fill="currentColor" />}
                {playingFromHere ? "Pause" : "Play all"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDraft(playlist.name);
                setEditing(true);
              }}
              aria-label="Rename playlist"
              title="Rename playlist"
              className="grid h-10 w-10 place-items-center rounded-full border border-plum-600 text-sand-300 transition-colors hover:border-sand-500 hover:text-sand-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={remove}
              aria-label="Delete playlist"
              title="Delete playlist"
              className="grid h-10 w-10 place-items-center rounded-full border border-plum-600 text-sand-300 transition-colors hover:border-hibiscus-400 hover:text-hibiscus-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-plum-600 p-10 text-center">
            <p className="font-display text-lg font-semibold">This playlist is empty</p>
            <p className="mt-2 text-sand-300">
              Go to{" "}
              <Link to="/home" className="font-semibold text-marigold-400 hover:text-marigold-300">
                Listen
              </Link>{" "}
              and use the playlist button on a track to add it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {tracks.map((song) => (
              <TrackRow
                key={song.id}
                song={song}
                isCurrent={currentSong?.id === song.id}
                isPlaying={isPlaying}
                onPlay={(s) => play(s.id, tracks)}
                onRemove={(s) => removeFromPlaylist(playlist.id, s.id).catch((e) => console.error(e))}
                removeLabel="Remove from playlist"
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
