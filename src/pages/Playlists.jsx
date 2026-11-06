import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import PlaylistArt from "../components/PlaylistArt";
import Spinner from "../components/Spinner";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

export default function Playlists() {
  const { playlists, ready, createPlaylist } = useLibrary();
  const { songs } = usePlayer();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const byId = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setBusy(true);
    try {
      const id = await createPlaylist(name);
      setName("");
      if (id) navigate(`/playlists/${id}`);
    } catch (err) {
      console.error(err);
      setError("Couldn't create the playlist. Check your Firestore rules.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Playlists</h1>

      <form onSubmit={create} className="mt-6 flex max-w-md gap-2">
        <label htmlFor="playlist-name" className="sr-only">New playlist name</label>
        <input
          id="playlist-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Name a new playlist"
          className="min-w-0 flex-1 rounded-full border border-plum-700 bg-plum-900 px-4 py-2.5 text-sm placeholder-sand-500 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
        />
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="flex items-center gap-2 rounded-full bg-marigold-400 px-5 py-2.5 text-sm font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-50"
        >
          {busy ? <Spinner /> : <Plus className="h-4 w-4" aria-hidden="true" />} Create
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-hibiscus-400">{error}</p>}

      <div className="mt-10">
        {!ready ? (
          <p className="text-sand-300">Loading…</p>
        ) : playlists.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-plum-600 p-10 text-center">
            <p className="font-display text-lg font-semibold">No playlists yet</p>
            <p className="mt-2 text-sand-300">Name one above, then add songs with the playlist button on any track.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {playlists.map((pl) => {
              const tracks = (pl.songIds || []).map((id) => byId.get(id)).filter(Boolean);
              return (
                <Link key={pl.id} to={`/playlists/${pl.id}`} className="group block">
                  <PlaylistArt songs={tracks} className="aspect-square w-full rounded-md shadow-lg shadow-black/40" />
                  <p className="mt-3 truncate text-sm font-semibold group-hover:text-marigold-400">{pl.name}</p>
                  <p className="text-sm text-sand-500">
                    {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
