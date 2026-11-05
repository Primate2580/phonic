import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toMillis } from "../lib/format";
import { useAuth } from "./AuthContext";

const PlayerContext = createContext(null);
// Playback time changes ~4x a second, so it lives in its own context
// to avoid re-rendering the whole song grid on every tick.
const TimeContext = createContext({ time: 0, duration: 0 });

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const [audio] = useState(() => new Audio());

  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(true);
  const [songsError, setSongsError] = useState("");

  const [currentId, setCurrentId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playError, setPlayError] = useState("");

  // Latest values for callbacks that must stay stable (audio event handlers).
  const latest = useRef({});
  latest.current = { songs, currentId, shuffle, repeat };

  // ---- Songs (live from Firestore) ----
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) {
      setSongs([]);
      setSongsLoading(false);
      return undefined;
    }
    setSongsLoading(true);
    return onSnapshot(
      collection(db, "songs"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => toMillis(b.uploadedAt) - toMillis(a.uploadedAt));
        setSongs(list);
        setSongsError("");
        setSongsLoading(false);
      },
      (err) => {
        console.error("Failed to load songs:", err);
        setSongsError(
          err?.code === "permission-denied"
            ? "You don't have permission to read songs. Check your Firestore rules."
            : "Couldn't load the library. Check your connection and refresh.",
        );
        setSongsLoading(false);
      },
    );
  }, [uid]);

  // ---- Stop everything on logout ----
  useEffect(() => {
    if (uid) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setCurrentId(null);
    setIsPlaying(false);
    setTime(0);
    setDuration(0);
    setPlayError("");
  }, [uid, audio]);

  // ---- Core controls ----
  const startSong = useCallback(
    (song) => {
      if (!song?.mp3URL) {
        setPlayError("This track has no audio file attached.");
        return;
      }
      audio.src = song.mp3URL;
      setCurrentId(song.id);
      setTime(0);
      setDuration(0);
      setPlayError("");
      audio.play().catch((err) => {
        if (err?.name !== "AbortError") {
          setPlayError("Couldn't play this track. The file may be missing or blocked.");
        }
      });
    },
    [audio],
  );

  const step = useCallback(
    (dir) => {
      const { songs: list, currentId: id, shuffle: shuf } = latest.current;
      if (!list.length) return;
      const idx = list.findIndex((s) => s.id === id);
      let n;
      if (shuf && list.length > 1) {
        do {
          n = Math.floor(Math.random() * list.length);
        } while (n === idx);
      } else {
        n = idx === -1 ? 0 : (idx + dir + list.length) % list.length;
      }
      startSong(list[n]);
    },
    [startSong],
  );

  const toggle = useCallback(() => {
    const { songs: list, currentId: id } = latest.current;
    if (!id) {
      if (list.length) startSong(list[0]);
      return;
    }
    if (audio.paused) {
      audio.play().catch(() => setPlayError("Couldn't play this track."));
    } else {
      audio.pause();
    }
  }, [audio, startSong]);

  const play = useCallback(
    (songId) => {
      const { songs: list, currentId: id } = latest.current;
      if (songId === id) {
        toggle();
        return;
      }
      const song = list.find((s) => s.id === songId);
      if (song) startSong(song);
    },
    [startSong, toggle],
  );

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    step(-1);
  }, [audio, step]);

  const seek = useCallback(
    (t) => {
      audio.currentTime = t;
      setTime(t);
    },
    [audio],
  );

  const setVolume = useCallback(
    (v) => {
      audio.volume = v;
      setVolumeState(v);
    },
    [audio],
  );

  const toggleShuffle = useCallback(() => setShuffle((v) => !v), []);
  const toggleRepeat = useCallback(() => setRepeat((v) => !v), []);

  // ---- Keep React state in sync with the real <audio> element ----
  useEffect(() => {
    audio.volume = 0.8;
    const onPlay = () => {
      setIsPlaying(true);
      setPlayError("");
    };
    const onPause = () => setIsPlaying(false);
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => {
      if (latest.current.repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        step(1);
      }
    };
    const onError = () => {
      if (!audio.getAttribute("src")) return;
      setIsPlaying(false);
      setPlayError("Couldn't load this track. The audio file may be missing.");
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audio, step]);

  const currentSong = useMemo(() => songs.find((s) => s.id === currentId) || null, [songs, currentId]);

  // ---- Lock-screen / headphone controls ----
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = currentSong
        ? new MediaMetadata({
            title: currentSong.title || "Untitled",
            artist: currentSong.artist || "",
            album: currentSong.album || "",
            artwork: currentSong.coverURL ? [{ src: currentSong.coverURL }] : [],
          })
        : null;
      navigator.mediaSession.setActionHandler("play", toggle);
      navigator.mediaSession.setActionHandler("pause", toggle);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      navigator.mediaSession.setActionHandler("previoustrack", prev);
    } catch {
      /* not supported */
    }
  }, [currentSong, toggle, next, prev]);

  const value = useMemo(
    () => ({
      songs,
      songsLoading,
      songsError,
      currentSong,
      isPlaying,
      volume,
      shuffle,
      repeat,
      playError,
      play,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      toggleShuffle,
      toggleRepeat,
    }),
    [
      songs, songsLoading, songsError, currentSong, isPlaying, volume, shuffle, repeat, playError,
      play, toggle, next, prev, seek, setVolume, toggleShuffle, toggleRepeat,
    ],
  );

  const timeValue = useMemo(() => ({ time, duration }), [time, duration]);

  return (
    <PlayerContext.Provider value={value}>
      <TimeContext.Provider value={timeValue}>{children}</TimeContext.Provider>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

export function usePlayerTime() {
  return useContext(TimeContext);
}
