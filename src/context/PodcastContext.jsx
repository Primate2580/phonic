import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toMillis } from "../lib/format";
import { useAuth } from "./AuthContext";

/**
 * shows/{id}                    -> { title, host, description, category, coverURL, createdAt }
 * episodes/{id}                 -> { showId, title, description, mp3URL, coverURL, publishedAt }
 * users/{uid}/follows/{showId}  -> { showId, followedAt }
 * users/{uid}/progress/{episodeId} -> { episodeId, showId, position, duration, completed, updatedAt }
 *
 * Episodes are exposed as "tracks" shaped like songs (kind: "episode") so the same
 * player can play them. Their ids are prefixed with "ep_" so they never clash with song ids.
 */
const PodcastContext = createContext(null);
const read = (d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) });

export function PodcastProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [shows, setShows] = useState([]);
  const [rawEpisodes, setRawEpisodes] = useState([]);
  const [follows, setFollows] = useState([]);
  const [progress, setProgress] = useState([]);
  const [ready, setReady] = useState({ shows: false, episodes: false });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) {
      setShows([]);
      setRawEpisodes([]);
      setFollows([]);
      setProgress([]);
      setReady({ shows: false, episodes: false });
      setError("");
      return undefined;
    }
    const fail = (what) => (err) => {
      console.error(`Could not load ${what}:`, err);
      if (err?.code === "permission-denied") {
        setError("Podcasts are blocked by your Firestore rules. Publish the latest firestore.rules.");
      }
      setReady((r) => ({ ...r, [what]: true }));
    };
    const unsubShows = onSnapshot(
      collection(db, "shows"),
      (snap) => {
        setShows(snap.docs.map(read).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)));
        setReady((r) => ({ ...r, shows: true }));
      },
      fail("shows"),
    );
    const unsubEpisodes = onSnapshot(
      collection(db, "episodes"),
      (snap) => {
        setRawEpisodes(snap.docs.map(read));
        setReady((r) => ({ ...r, episodes: true }));
      },
      fail("episodes"),
    );
    const unsubFollows = onSnapshot(
      collection(db, "users", uid, "follows"),
      (snap) => setFollows(snap.docs.map(read).sort((a, b) => toMillis(b.followedAt) - toMillis(a.followedAt))),
      (err) => console.error("Could not load followed shows:", err),
    );
    const unsubProgress = onSnapshot(
      collection(db, "users", uid, "progress"),
      (snap) => setProgress(snap.docs.map(read)),
      (err) => console.error("Could not load listening progress:", err),
    );
    return () => {
      unsubShows();
      unsubEpisodes();
      unsubFollows();
      unsubProgress();
    };
  }, [uid]);

  const showsById = useMemo(() => new Map(shows.map((s) => [s.id, s])), [shows]);

  // Newest first, shaped like songs so the player can play them.
  const episodes = useMemo(
    () =>
      rawEpisodes
        .map((ep) => {
          const show = showsById.get(ep.showId);
          return {
            id: `ep_${ep.id}`,
            rawId: ep.id,
            kind: "episode",
            showId: ep.showId,
            title: ep.title || "Untitled episode",
            description: ep.description || "",
            artist: show?.host || show?.title || "Podcast",
            album: show?.title || "",
            mp3URL: ep.mp3URL,
            coverURL: ep.coverURL || show?.coverURL || "",
            publishedAt: ep.publishedAt,
          };
        })
        .sort((a, b) => toMillis(b.publishedAt) - toMillis(a.publishedAt)),
    [rawEpisodes, showsById],
  );

  const followedIds = useMemo(() => new Set(follows.map((f) => f.showId || f.id)), [follows]);

  const toggleFollow = useCallback(
    async (showId) => {
      if (!uid) return;
      const ref = doc(db, "users", uid, "follows", showId);
      try {
        if (followedIds.has(showId)) await deleteDoc(ref);
        else await setDoc(ref, { showId, followedAt: serverTimestamp() });
      } catch (err) {
        console.error("Could not update follow:", err);
      }
    },
    [uid, followedIds],
  );

  const progressById = useMemo(() => new Map(progress.map((p) => [p.episodeId || p.id, p])), [progress]);

  // Episodes the listener started but hasn't finished, most recently played first.
  const continueListening = useMemo(() => {
    const byRawId = new Map(episodes.map((e) => [e.rawId, e]));
    return progress
      .filter((p) => !p.completed && p.position > 5 && byRawId.has(p.episodeId || p.id))
      .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt))
      .map((p) => ({ episode: byRawId.get(p.episodeId || p.id), progress: p }));
  }, [progress, episodes]);

  const saveProgress = useCallback(
    async (episode, position, duration, completed = false) => {
      if (!uid || !episode?.rawId) return;
      try {
        await setDoc(
          doc(db, "users", uid, "progress", episode.rawId),
          {
            episodeId: episode.rawId,
            showId: episode.showId,
            position: Math.max(0, Math.floor(position)),
            duration: Math.max(0, Math.floor(duration)),
            completed,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (err) {
        console.warn("Could not save listening progress:", err);
      }
    },
    [uid],
  );

  const value = useMemo(
    () => ({
      shows,
      showsById,
      episodes,
      follows,
      followedIds,
      ready: ready.shows && ready.episodes,
      error,
      toggleFollow,
      progressById,
      continueListening,
      saveProgress,
    }),
    [shows, showsById, episodes, follows, followedIds, ready, error, toggleFollow, progressById, continueListening, saveProgress],
  );

  return <PodcastContext.Provider value={value}>{children}</PodcastContext.Provider>;
}

export function usePodcasts() {
  const ctx = useContext(PodcastContext);
  if (!ctx) throw new Error("usePodcasts must be used inside <PodcastProvider>");
  return ctx;
}
