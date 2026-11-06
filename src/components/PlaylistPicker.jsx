import { useEffect, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";
import Spinner from "./Spinner";

/** Modal for adding one song to (or removing it from) playlists, or creating a new one. */
export default function PlaylistPicker({ song, onClose }) {
  const { playlists, addToPlaylist, removeFromPlaylist, createPlaylist } = useLibrary();
  const [name, setName] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function toggle(playlist) {
    setError("");
    setBusyId(playlist.id);
    try {
      if ((playlist.songIds || []).includes(song.id)) await removeFromPlaylist(playlist.id, song.id);
      else await addToPlaylist(playlist.id, song.id);
    } catch (err) {
      console.error(err);
      setError("Couldn't update that playlist. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setCreating(true);
    try {
      await createPlaylist(name, song.id);
      setName("");
    } catch (err) {
      console.error(err);
      setError("Couldn't create the playlist. Check your Firestore rules.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-plum-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-plum-700 bg-plum-900 p-5 shadow-2xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="picker-title" className="font-display text-lg font-semibold">Add to playlist</h2>
            <p className="mt-1 truncate text-sm text-sand-500">{song.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-sand-500 hover:text-sand-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="no-scrollbar mt-4 max-h-64 space-y-1 overflow-y-auto">
          {playlists.length === 0 && (
            <li className="rounded-lg border border-dashed border-plum-600 p-4 text-center text-sm text-sand-300">
              You have no playlists yet. Create your first one below.
            </li>
          )}
          {playlists.map((pl) => {
            const has = (pl.songIds || []).includes(song.id);
            return (
              <li key={pl.id}>
                <button
                  type="button"
                  onClick={() => toggle(pl)}
                  disabled={busyId === pl.id}
                  aria-pressed={has}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-plum-800"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                      has ? "border-marigold-400 bg-marigold-400 text-plum-950" : "border-plum-600"
                    }`}
                  >
                    {busyId === pl.id ? <Spinner className="h-3 w-3" /> : has && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{pl.name}</span>
                  <span className="text-xs text-sand-500">{(pl.songIds || []).length}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <form onSubmit={create} className="mt-4 flex gap-2 border-t border-plum-800 pt-4">
          <label htmlFor="new-playlist" className="sr-only">New playlist name</label>
          <input
            id="new-playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="New playlist name"
            className="min-w-0 flex-1 rounded-lg border border-plum-700 bg-plum-950 px-3 py-2 text-sm placeholder-sand-500 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
          />
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="flex items-center gap-1.5 rounded-full bg-marigold-400 px-4 py-2 text-sm font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-50"
          >
            {creating ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Create
          </button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-hibiscus-400">{error}</p>}
      </div>
    </div>
  );
}
