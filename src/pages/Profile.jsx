import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, LogOut, ShieldCheck } from "lucide-react";
import AvatarModal from "../components/AvatarModal";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { authMessage } from "../lib/format";

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-plum-700 bg-plum-900 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Profile() {
  const { user, displayName, photoURL, isAdmin, providerIds, memberSince, updateUsername, resetPassword, logout } = useAuth();
  const { likes, playlists } = useLibrary();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const [name, setName] = useState(displayName);
  const [nameBusy, setNameBusy] = useState(false);
  const [nameStatus, setNameStatus] = useState(null); // { type, text }
  const [resetBusy, setResetBusy] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const email = user?.email || "";
  const usesPassword = providerIds.includes("password");
  const usesGoogle = providerIds.includes("google.com");
  const cleanName = name.trim();
  const nameChanged = cleanName !== displayName;

  async function saveName(e) {
    e.preventDefault();
    if (cleanName.length < 2) {
      setNameStatus({ type: "error", text: "Use at least 2 characters." });
      return;
    }
    setNameBusy(true);
    setNameStatus(null);
    try {
      await updateUsername(cleanName);
      setNameStatus({ type: "success", text: "Name updated." });
    } catch (err) {
      console.error(err);
      setNameStatus({ type: "error", text: "Couldn't save your name. Try again." });
    } finally {
      setNameBusy(false);
    }
  }

  async function sendReset() {
    setResetBusy(true);
    setResetStatus(null);
    try {
      await resetPassword(email);
      setResetStatus({ type: "success", text: `We sent a reset link to ${email}. Check your inbox and spam folder.` });
    } catch (err) {
      console.error(err);
      setResetStatus({ type: "error", text: authMessage(err) });
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8 md:px-8 md:py-10">
      {/* Identity */}
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setAvatarOpen(true)}
          aria-label="Change profile photo"
          className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-plum-700 ring-2 ring-marigold-400/60 sm:h-28 sm:w-28"
        >
          {photoURL ? (
            <img src={photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center font-display text-4xl font-semibold">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="absolute inset-0 grid place-items-center bg-plum-950/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera className="h-6 w-6" aria-hidden="true" />
          </span>
        </button>
        <div className="min-w-0">
          <h1 className="break-words font-display text-2xl font-semibold tracking-tight sm:text-3xl">{displayName}</h1>
          <p className="mt-1 truncate text-sand-300">{email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sand-500">
            {memberSince && <span>Joined {memberSince.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>}
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-1.5 font-medium text-marigold-400 hover:text-marigold-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin
              </Link>
            )}
          </div>
          <button type="button" onClick={() => setAvatarOpen(true)} className="mt-3 text-sm font-semibold text-marigold-400 hover:text-marigold-300">
            {photoURL ? "Change photo" : "Add a photo"}
          </button>
        </div>
      </div>

      {/* Display name */}
      <Section title="Display name">
        <form onSubmit={saveName} className="space-y-3">
          <div>
            <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium text-sand-300">
              Shown in your greeting and sidebar
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameStatus(null);
              }}
              maxLength={30}
              className="w-full rounded-lg border border-plum-700 bg-plum-950 px-4 py-2.5 focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
            />
          </div>
          {nameStatus && (
            <p role={nameStatus.type === "error" ? "alert" : "status"} className={`text-sm ${nameStatus.type === "error" ? "text-hibiscus-400" : "text-marigold-300"}`}>
              {nameStatus.text}
            </p>
          )}
          <button
            type="submit"
            disabled={!nameChanged || nameBusy}
            className="flex items-center gap-2 rounded-full bg-marigold-400 px-6 py-2.5 text-sm font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-50"
          >
            {nameBusy && <Spinner />} Save name
          </button>
        </form>
      </Section>

      {/* Your music */}
      <Section title="Your music">
        <ul className="divide-y divide-plum-800">
          <li>
            <Link to="/liked" className="flex items-center justify-between py-3 hover:text-marigold-400">
              <span>Liked songs</span>
              <span className="tabular-nums text-sand-300">{likes.length}</span>
            </Link>
          </li>
          <li>
            <Link to="/playlists" className="flex items-center justify-between py-3 hover:text-marigold-400">
              <span>Playlists</span>
              <span className="tabular-nums text-sand-300">{playlists.length}</span>
            </Link>
          </li>
        </ul>
      </Section>

      {/* Account */}
      <Section title="Account">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-sand-500">Email</dt>
            <dd className="min-w-0 truncate">{email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sand-500">Sign-in method</dt>
            <dd>{[usesGoogle && "Google", usesPassword && "Email and password"].filter(Boolean).join(" and ") || "Email"}</dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-plum-800 pt-5">
          {usesPassword ? (
            <>
              <p className="text-sm text-sand-300">Want a new password? We'll email you a link to set one.</p>
              {resetStatus && (
                <p role={resetStatus.type === "error" ? "alert" : "status"} className={`mt-3 text-sm ${resetStatus.type === "error" ? "text-hibiscus-400" : "text-marigold-300"}`}>
                  {resetStatus.text}
                </p>
              )}
              <button
                type="button"
                onClick={sendReset}
                disabled={resetBusy}
                className="mt-3 flex items-center gap-2 rounded-full border border-plum-600 px-5 py-2 text-sm font-semibold transition-colors hover:border-sand-500 disabled:opacity-60"
              >
                {resetBusy && <Spinner />} Email me a reset link
              </button>
            </>
          ) : (
            <p className="text-sm text-sand-300">You sign in with Google, so your password is managed in your Google account.</p>
          )}
        </div>
      </Section>

      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-2 rounded-full border border-plum-600 px-6 py-2.5 text-sm font-semibold text-sand-100 transition-colors hover:border-hibiscus-400 hover:text-hibiscus-400"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
      </button>

      {avatarOpen && <AvatarModal onClose={() => setAvatarOpen(false)} />}
    </div>
  );
}
