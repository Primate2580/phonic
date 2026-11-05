import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../lib/uploads";
import Spinner from "./Spinner";

export default function AvatarModal({ onClose }) {
  const { user, photoURL, saveAvatar } = useAuth();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG or WebP).");
      return;
    }
    setError("");
    setBusy(true);
    setPct(0);
    try {
      const url = await uploadImage(file, { folder: `users/${user.uid}`, onProgress: setPct });
      await saveAvatar(url);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-plum-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-title"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-plum-700 bg-plum-900 p-6 text-center shadow-2xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="text-sand-500 hover:text-sand-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto -mt-2 grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-plum-800 ring-2 ring-marigold-400/60">
          {photoURL ? (
            <img src={photoURL} alt="Your current profile" className="h-full w-full object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-sand-500" />
          )}
        </div>
        <h2 id="avatar-title" className="mt-4 font-display text-xl font-semibold">
          {photoURL ? "Change your photo" : "Add a profile photo"}
        </h2>
        <p className="mt-2 text-sm text-sand-300">Pick a square-ish image. It shows next to your name in Phonic.</p>

        {busy && (
          <div className="mt-5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-1.5 overflow-hidden rounded-full bg-plum-700">
              <div className="h-full bg-marigold-400 transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-sand-500">Uploading {pct}%</p>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-hibiscus-400">{error}</p>}

        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} tabIndex={-1} />
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-full bg-marigold-400 px-5 py-2.5 font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-60"
          >
            {busy ? <Spinner /> : <Camera className="h-4 w-4" />}
            {busy ? "Uploading" : "Choose a photo"}
          </button>
          <button type="button" disabled={busy} onClick={onClose} className="rounded-full px-5 py-2 text-sm text-sand-500 hover:text-sand-100">
            {photoURL ? "Cancel" : "Skip for now"}
          </button>
        </div>
      </div>
    </div>
  );
}
