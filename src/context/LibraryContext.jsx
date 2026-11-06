import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toMillis } from "../lib/format";
import PlaylistPicker from "../components/PlaylistPicker";
import { useAuth } from "./AuthContext";

/**
 * Per-user data, stored at:
 *   users/{uid}/likes/{songId}      -> { songId, likedAt }
 *   users/{uid}/playlists/{id}      -> { name, songIds: [], createdAt, updatedAt }
 */
const LibraryContext = createContext(null);

const read = (d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) });

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [likes, setLikes] = useState([]); // newest first
  const [playlists, setPlaylists] = useState([]); // newest first
  const [likesReady, setLikesReady] = useState(false);
  const [playlistsReady, setPlaylistsReady] = useState(false);
  const [pickerSong, setPickerSong] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLikes([]);
      setPlaylists([]);
      setLikesReady(false);
      setPlaylistsReady(false);
      setPickerSong(null);
      return undefined;
    }
    const unsubLikes = onSnapshot(
      collection(db, "users", uid, "likes"),
      (snap) => {
        const list = snap.docs.map(read).sort((a, b) => toMillis(b.likedAt) - toMillis(a.likedAt));
        setLikes(list);
        setLikesReady(true);
      },
      (err) => {
        console.error("Could not load liked songs:", err);
        setLikesReady(true);
      },
    );
    const unsubPlaylists = onSnapshot(
      collection(db, "users", uid, "playlists"),
      (snap) => {
        const list = snap.docs.map(read).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setPlaylists(list);
        setPlaylistsReady(true);
      },
      (err) => {
        console.error("Could not load playlists:", err);
        setPlaylistsReady(true);
      },
    );
    return () => {
      unsubLikes();
      unsubPlaylists();
    };
  }, [uid]);

  const likedIds = useMemo(() => new Set(likes.map((l) => l.songId || l.id)), [likes]);

  const toggleLike = useCallback(
    async (songId) => {
      if (!uid) return;
      const ref = doc(db, "users", uid, "likes", songId);
      try {
        if (likedIds.has(songId)) await deleteDoc(ref);
        else await setDoc(ref, { songId, likedAt: serverTimestamp() });
      } catch (err) {
        console.error("Could not update like:", err);
      }
    },
    [uid, likedIds],
  );

  const createPlaylist = useCallback(
    async (name, firstSongId) => {
      const clean = name.trim().slice(0, 60);
      if (!uid || !clean) return null;
      const ref = await addDoc(collection(db, "users", uid, "playlists"), {
        name: clean,
        songIds: firstSongId ? [firstSongId] : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    [uid],
  );

  const renamePlaylist = useCallback(
    async (id, name) => {
      const clean = name.trim().slice(0, 60);
      if (!uid || !clean) return;
      await updateDoc(doc(db, "users", uid, "playlists", id), { name: clean, updatedAt: serverTimestamp() });
    },
    [uid],
  );

  const deletePlaylist = useCallback(
    async (id) => {
      if (!uid) return;
      await deleteDoc(doc(db, "users", uid, "playlists", id));
    },
    [uid],
  );

  const addToPlaylist = useCallback(
    async (id, songId) => {
      if (!uid) return;
      await updateDoc(doc(db, "users", uid, "playlists", id), {
        songIds: arrayUnion(songId),
        updatedAt: serverTimestamp(),
      });
    },
    [uid],
  );

  const removeFromPlaylist = useCallback(
    async (id, songId) => {
      if (!uid) return;
      await updateDoc(doc(db, "users", uid, "playlists", id), {
        songIds: arrayRemove(songId),
        updatedAt: serverTimestamp(),
      });
    },
    [uid],
  );

  const openPicker = useCallback((song) => setPickerSong(song), []);
  const closePicker = useCallback(() => setPickerSong(null), []);

  const value = useMemo(
    () => ({
      likes,
      likedIds,
      playlists,
      ready: likesReady && playlistsReady,
      toggleLike,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      openPicker,
    }),
    [likes, likedIds, playlists, likesReady, playlistsReady, toggleLike, createPlaylist, renamePlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist, openPicker],
  );

  return (
    <LibraryContext.Provider value={value}>
      {children}
      {pickerSong && <PlaylistPicker song={pickerSong} onClose={closePicker} />}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside <LibraryProvider>");
  return ctx;
}
