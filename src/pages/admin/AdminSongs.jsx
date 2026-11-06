import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { FileAudio, ImagePlus, Trash2, Upload } from "lucide-react";
import Cover from "../../components/Cover";
import Spinner from "../../components/Spinner";
import { usePlayer } from "../../context/PlayerContext";
import { auth, db } from "../../lib/firebase";
import { SONG_CATEGORIES } from "../../lib/categories";
import { toMillis } from "../../lib/format";
import { uploadAudio, uploadImage } from "../../lib/uploads";

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|flac)$/i;
const inputClass =
  "w-full rounded-lg border border-plum-700 bg-plum-950 px-4 py-2.5 text-sm placeholder-sand-500 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400";

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
}

export default function AdminSongs() {
  const { songs, songsLoading } = usePlayer();
  const [form, setForm] = useState({ title: "", artist: "", album: "", category: "" });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text }
  const [removingId, setRemovingId] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function addFiles(fileList) {
    for (const file of Array.from(fileList)) {
      if (file.type.startsWith("audio/") || AUDIO_EXT.test(file.name)) {
        setAudioFile(file);
        setForm((f) => (f.title ? f : { ...f, title: titleFromFilename(file.name) }));
      } else if (file.type.startsWith("image/")) {
        setCoverFile(file);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    const title = form.title.trim();
    const artist = form.artist.trim();
    if (!title) return setStatus({ type: "error", text: "Add a track title." });
    if (!artist) return setStatus({ type: "error", text: "Add an artist name." });
    if (!audioFile) return setStatus({ type: "error", text: "Add an audio file." });

    setBusy(true);
    try {
      let coverURL = "";
      if (coverFile) {
        setStage("Uploading cover");
        setPct(0);
        coverURL = await uploadImage(coverFile, { folder: "covers", onProgress: setPct });
      }
      setStage("Uploading audio");
      setPct(0);
      const token = await auth.currentUser?.getIdToken();
      const mp3URL = await uploadAudio(audioFile, { token, onProgress: setPct });

      setStage("Publishing");
      setPct(100);
      await addDoc(collection(db, "songs"), {
        title,
        artist,
        album: form.album.trim(),
        category: form.category,
        mp3URL,
        coverURL,
        uploadedAt: serverTimestamp(),
      });

      setStatus({ type: "success", text: `“${title}” is live.` });
      setForm((f) => ({ title: "", artist: "", album: "", category: f.category }));
      setAudioFile(null);
      setCoverFile(null);
    } catch (err) {
      console.error(err);
      const denied = err?.code === "permission-denied";
      setStatus({
        type: "error",
        text: denied ? "Firestore refused the write. Publish the rules in firestore.rules and try again." : err.message || "Upload failed.",
      });
    } finally {
      setBusy(false);
      setStage("");
      setPct(0);
    }
  }

  async function remove(song) {
    if (!window.confirm(`Remove “${song.title}” from the library?`)) return;
    setRemovingId(song.id);
    try {
      await deleteDoc(doc(db, "songs", song.id));
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Couldn't remove that track. Try again." });
    } finally {
      setRemovingId(null);
    }
  }

  async function changeCategory(song, category) {
    try {
      await updateDoc(doc(db, "songs", song.id), { category });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Couldn't change the category. Try again." });
    }
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* Upload */}
        <form onSubmit={handleSubmit} className="space-y-4 self-start rounded-2xl border border-plum-700 bg-plum-900 p-5">
          <h2 className="font-display text-lg font-semibold">New track</h2>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-sand-300">Title</label>
            <input id="title" className={inputClass} value={form.title} onChange={set("title")} placeholder="Track title" />
          </div>
          <div>
            <label htmlFor="artist" className="mb-1.5 block text-sm font-medium text-sand-300">Artist</label>
            <input id="artist" className={inputClass} value={form.artist} onChange={set("artist")} placeholder="Artist name" />
          </div>
          <div>
            <label htmlFor="album" className="mb-1.5 block text-sm font-medium text-sand-300">Album (optional)</label>
            <input id="album" className={inputClass} value={form.album} onChange={set("album")} placeholder="Album name" />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-sand-300">Category</label>
            <select id="category" className={inputClass} value={form.category} onChange={set("category")}>
              <option value="">No category</option>
              {SONG_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
              dragging ? "border-marigold-400 bg-marigold-400/5" : "border-plum-600"
            }`}
          >
            <input ref={fileInput} type="file" multiple accept="audio/*,image/*" className="sr-only" tabIndex={-1} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 text-sm font-medium text-sand-300 hover:text-marigold-400">
              <Upload className="h-4 w-4" /> Drop the audio and cover here, or browse
            </button>

            {(audioFile || coverFile) && (
              <ul className="mt-3 space-y-2 text-left text-sm">
                {audioFile && (
                  <li className="flex items-center gap-2 rounded-lg bg-plum-800 px-3 py-2">
                    <FileAudio className="h-4 w-4 shrink-0 text-marigold-400" />
                    <span className="min-w-0 flex-1 truncate">{audioFile.name}</span>
                    <button type="button" onClick={() => setAudioFile(null)} className="text-xs text-sand-500 hover:text-sand-100">Remove</button>
                  </li>
                )}
                {coverFile && (
                  <li className="flex items-center gap-2 rounded-lg bg-plum-800 px-3 py-2">
                    {coverPreview ? <img src={coverPreview} alt="" className="h-6 w-6 shrink-0 rounded object-cover" /> : <ImagePlus className="h-4 w-4" />}
                    <span className="min-w-0 flex-1 truncate">{coverFile.name}</span>
                    <button type="button" onClick={() => setCoverFile(null)} className="text-xs text-sand-500 hover:text-sand-100">Remove</button>
                  </li>
                )}
              </ul>
            )}
            {!coverFile && audioFile && (
              <p className="mt-2 text-xs text-sand-500">No cover? A generated sleeve is used.</p>
            )}
          </div>

          {busy && (
            <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="mb-1 flex justify-between text-xs text-sand-300">
                <span>{stage}</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-plum-700">
                <div className="h-full bg-marigold-400 transition-[width] duration-200" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {status && (
            <p role={status.type === "error" ? "alert" : "status"} className={`text-sm ${status.type === "error" ? "text-hibiscus-400" : "text-marigold-300"}`}>
              {status.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold-400 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-60"
          >
            {busy && <Spinner />} {busy ? "Publishing" : "Publish track"}
          </button>
        </form>

        {/* Inventory */}
        <section aria-labelledby="inv-title" className="min-w-0">
          <h2 id="inv-title" className="font-display text-lg font-semibold">
            Published tracks <span className="font-sans text-sm font-normal text-sand-500">({songs.length})</span>
          </h2>

          {songsLoading ? (
            <p className="mt-6 text-sand-300">Loading tracks…</p>
          ) : songs.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-plum-600 p-8 text-center text-sand-300">
              No tracks yet. Publish your first one with the form.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-plum-800">
              {songs.map((song) => (
                <li key={song.id} className="flex items-center gap-4 py-3">
                  <Cover song={song} className="h-12 w-12 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{song.title}</p>
                    <p className="truncate text-sm text-sand-500">
                      {song.artist}
                      {song.album ? `, ${song.album}` : ""}
                    </p>
                  </div>
                  <select
                    aria-label={`Category for ${song.title}`}
                    value={SONG_CATEGORIES.includes(song.category) ? song.category : song.category || ""}
                    onChange={(e) => changeCategory(song, e.target.value)}
                    className="hidden max-w-[8.5rem] rounded-lg border border-plum-700 bg-plum-950 px-2 py-1.5 text-xs text-sand-300 focus:border-marigold-400 focus:outline-none sm:block"
                  >
                    <option value="">No category</option>
                    {song.category && !SONG_CATEGORIES.includes(song.category) && <option value={song.category}>{song.category}</option>}
                    {SONG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span className="hidden text-xs text-sand-500 lg:block">
                    {toMillis(song.uploadedAt) ? new Date(toMillis(song.uploadedAt)).toLocaleDateString() : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(song)}
                    disabled={removingId === song.id}
                    aria-label={`Remove ${song.title}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-sand-500 transition-colors hover:bg-hibiscus-400/10 hover:text-hibiscus-400 disabled:opacity-50"
                  >
                    {removingId === song.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
