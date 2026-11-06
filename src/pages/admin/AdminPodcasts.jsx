import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { FileAudio, ImagePlus, Trash2 } from "lucide-react";
import Cover from "../../components/Cover";
import Spinner from "../../components/Spinner";
import { usePodcasts } from "../../context/PodcastContext";
import { PODCAST_CATEGORIES } from "../../lib/categories";
import { auth, db } from "../../lib/firebase";
import { formatDate } from "../../lib/format";
import { uploadAudio, uploadImage } from "../../lib/uploads";

const inputClass =
  "w-full rounded-lg border border-plum-700 bg-plum-950 px-4 py-2.5 text-sm placeholder-sand-500 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400";

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-sand-300">{label}</label>
      {children}
    </div>
  );
}

function Progress({ stage, pct }) {
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="mb-1 flex justify-between text-xs text-sand-300">
        <span>{stage}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-plum-700">
        <div className="h-full bg-marigold-400 transition-[width] duration-200" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Message({ status }) {
  if (!status) return null;
  return (
    <p role={status.type === "error" ? "alert" : "status"} className={`text-sm ${status.type === "error" ? "text-hibiscus-400" : "text-marigold-300"}`}>
      {status.text}
    </p>
  );
}

const submitClass =
  "flex w-full items-center justify-center gap-2 rounded-full bg-marigold-400 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-60";

/* ---------------- New show ---------------- */
function ShowForm() {
  const [form, setForm] = useState({ title: "", host: "", category: "", description: "" });
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    if (!form.title.trim()) return setStatus({ type: "error", text: "Add a show title." });
    if (!form.host.trim()) return setStatus({ type: "error", text: "Add a host name." });
    setBusy(true);
    try {
      let coverURL = "";
      if (cover) coverURL = await uploadImage(cover, { folder: "podcasts", onProgress: setPct });
      await addDoc(collection(db, "shows"), {
        title: form.title.trim(),
        host: form.host.trim(),
        category: form.category,
        description: form.description.trim(),
        coverURL,
        createdAt: serverTimestamp(),
      });
      setStatus({ type: "success", text: `“${form.title.trim()}” was created. Add its first episode below.` });
      setForm({ title: "", host: "", category: "", description: "" });
      setCover(null);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: err?.code === "permission-denied" ? "Firestore refused the write. Publish the latest firestore.rules." : err.message || "Couldn't create the show.",
      });
    } finally {
      setBusy(false);
      setPct(0);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-plum-700 bg-plum-900 p-5">
      <h2 className="font-display text-lg font-semibold">New show</h2>
      <Field label="Title" id="show-title">
        <input id="show-title" className={inputClass} value={form.title} onChange={set("title")} placeholder="Show title" />
      </Field>
      <Field label="Host" id="show-host">
        <input id="show-host" className={inputClass} value={form.host} onChange={set("host")} placeholder="Who presents it?" />
      </Field>
      <Field label="Category" id="show-cat">
        <select id="show-cat" className={inputClass} value={form.category} onChange={set("category")}>
          <option value="">No category</option>
          {PODCAST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Description" id="show-desc">
        <textarea id="show-desc" rows={3} className={inputClass} value={form.description} onChange={set("description")} placeholder="What is this show about?" />
      </Field>

      <div>
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => { setCover(e.target.files?.[0] || null); e.target.value = ""; }} />
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 text-sm font-medium text-sand-300 hover:text-marigold-400">
          <ImagePlus className="h-4 w-4" /> {cover ? cover.name : "Add a cover image"}
        </button>
        {cover && (
          <button type="button" onClick={() => setCover(null)} className="ml-3 text-xs text-sand-500 hover:text-sand-100">Remove</button>
        )}
      </div>

      {busy && cover && <Progress stage="Uploading cover" pct={pct} />}
      <Message status={status} />
      <button type="submit" disabled={busy} className={submitClass}>{busy && <Spinner />} {busy ? "Creating" : "Create show"}</button>
    </form>
  );
}

/* ---------------- New episode ---------------- */
function EpisodeForm({ show }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const [audio, setAudio] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    if (!form.title.trim()) return setStatus({ type: "error", text: "Add an episode title." });
    if (!audio) return setStatus({ type: "error", text: "Add the episode's audio file." });
    setBusy(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      // The worker only accepts keys under songs/, so episodes live in songs/episodes/.
      const mp3URL = await uploadAudio(audio, { token, folder: "songs/episodes", onProgress: setPct });
      await addDoc(collection(db, "episodes"), {
        showId: show.id,
        title: form.title.trim(),
        description: form.description.trim(),
        mp3URL,
        publishedAt: serverTimestamp(),
      });
      setStatus({ type: "success", text: `“${form.title.trim()}” is live.` });
      setForm({ title: "", description: "" });
      setAudio(null);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: err?.code === "permission-denied" ? "Firestore refused the write. Publish the latest firestore.rules." : err.message || "Upload failed.",
      });
    } finally {
      setBusy(false);
      setPct(0);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-plum-700 bg-plum-900 p-5">
      <h2 className="font-display text-lg font-semibold">New episode <span className="font-sans text-sm font-normal text-sand-500">for {show.title}</span></h2>
      <Field label="Title" id="ep-title">
        <input id="ep-title" className={inputClass} value={form.title} onChange={set("title")} placeholder="Episode title" />
      </Field>
      <Field label="Description" id="ep-desc">
        <textarea id="ep-desc" rows={3} className={inputClass} value={form.description} onChange={set("description")} placeholder="Show notes (optional)" />
      </Field>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setAudio(f);
            if (f) setForm((cur) => (cur.title ? cur : { ...cur, title: f.name.replace(/\.[^.]+$/, "").replace(/_/g, " ") }));
            e.target.value = "";
          }}
        />
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 text-sm font-medium text-sand-300 hover:text-marigold-400">
          <FileAudio className="h-4 w-4" /> {audio ? audio.name : "Choose the audio file"}
        </button>
        {audio && <button type="button" onClick={() => setAudio(null)} className="ml-3 text-xs text-sand-500 hover:text-sand-100">Remove</button>}
      </div>
      {busy && <Progress stage="Uploading audio" pct={pct} />}
      <Message status={status} />
      <button type="submit" disabled={busy} className={submitClass}>{busy && <Spinner />} {busy ? "Publishing" : "Publish episode"}</button>
    </form>
  );
}

/* ---------------- Tab ---------------- */
export default function AdminPodcasts() {
  const { shows, episodes, ready } = usePodcasts();
  const [selectedId, setSelectedId] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const selected = shows.find((s) => s.id === selectedId) || null;
  const selectedEpisodes = episodes.filter((e) => e.showId === selectedId);

  useEffect(() => {
    if (selectedId && !shows.some((s) => s.id === selectedId)) setSelectedId("");
  }, [shows, selectedId]);

  async function removeShow(show) {
    const eps = episodes.filter((e) => e.showId === show.id);
    const extra = eps.length ? ` and its ${eps.length} episode${eps.length === 1 ? "" : "s"}` : "";
    if (!window.confirm(`Delete “${show.title}”${extra}?`)) return;
    setError("");
    setBusyId(show.id);
    try {
      for (const ep of eps) await deleteDoc(doc(db, "episodes", ep.rawId));
      await deleteDoc(doc(db, "shows", show.id));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete that show. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeEpisode(ep) {
    if (!window.confirm(`Delete the episode “${ep.title}”?`)) return;
    setError("");
    setBusyId(ep.id);
    try {
      await deleteDoc(doc(db, "episodes", ep.rawId));
    } catch (err) {
      console.error(err);
      setError("Couldn't delete that episode. Try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <div className="space-y-6 self-start">
        {selected && <EpisodeForm key={selected.id} show={selected} />}
        <ShowForm />
      </div>

      <div className="min-w-0 space-y-10">
        {error && <p role="alert" className="text-sm text-hibiscus-400">{error}</p>}

        <section aria-labelledby="shows-title">
          <h2 id="shows-title" className="font-display text-lg font-semibold">
            Shows <span className="font-sans text-sm font-normal text-sand-500">({shows.length})</span>
          </h2>
          {!ready ? (
            <p className="mt-6 text-sand-300">Loading…</p>
          ) : shows.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-plum-600 p-8 text-center text-sand-300">No shows yet. Create the first one with the form.</p>
          ) : (
            <ul className="mt-4 divide-y divide-plum-800">
              {shows.map((show) => {
                const count = episodes.filter((e) => e.showId === show.id).length;
                const active = show.id === selectedId;
                return (
                  <li key={show.id} className="flex items-center gap-4 py-3">
                    <Cover song={{ title: show.title, coverURL: show.coverURL }} className="h-12 w-12 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{show.title}</p>
                      <p className="truncate text-sm text-sand-500">
                        {show.host}{show.category ? `, ${show.category}` : ""}, {count} {count === 1 ? "episode" : "episodes"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(active ? "" : show.id)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        active ? "border-marigold-400 text-marigold-400" : "border-plum-600 text-sand-300 hover:border-sand-500"
                      }`}
                    >
                      {active ? "Managing" : "Episodes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeShow(show)}
                      disabled={busyId === show.id}
                      aria-label={`Delete ${show.title}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-sand-500 transition-colors hover:bg-hibiscus-400/10 hover:text-hibiscus-400 disabled:opacity-50"
                    >
                      {busyId === show.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {selected && (
          <section aria-labelledby="eps-title">
            <h2 id="eps-title" className="font-display text-lg font-semibold">
              Episodes of {selected.title} <span className="font-sans text-sm font-normal text-sand-500">({selectedEpisodes.length})</span>
            </h2>
            {selectedEpisodes.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-plum-600 p-8 text-center text-sand-300">No episodes yet. Add one with the form.</p>
            ) : (
              <ul className="mt-4 divide-y divide-plum-800">
                {selectedEpisodes.map((ep) => (
                  <li key={ep.id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{ep.title}</p>
                      <p className="text-sm text-sand-500">{formatDate(ep.publishedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEpisode(ep)}
                      disabled={busyId === ep.id}
                      aria-label={`Delete ${ep.title}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-sand-500 transition-colors hover:bg-hibiscus-400/10 hover:text-hibiscus-400 disabled:opacity-50"
                    >
                      {busyId === ep.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
