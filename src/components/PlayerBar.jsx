import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { usePlayer, usePlayerTime } from "../context/PlayerContext";
import { formatTime } from "../lib/format";
import Cover from "./Cover";

function IconButton({ label, active = false, className = "", children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
        active ? "text-marigold-400" : "text-sand-300 hover:text-sand-100"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default function PlayerBar() {
  const { currentSong, isPlaying, volume, shuffle, repeat, playError, toggle, next, prev, seek, setVolume, toggleShuffle, toggleRepeat } =
    usePlayer();
  const { time, duration } = usePlayerTime();

  const seekPct = duration ? (time / duration) * 100 : 0;
  const idle = !currentSong;

  return (
    <footer className="border-t border-plum-700/70 bg-plum-900 px-4 py-3 md:px-6">
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 md:grid-cols-[1fr_minmax(320px,2fr)_1fr]">
        {/* Track */}
        <div className="flex min-w-0 items-center gap-3">
          {idle ? (
            <div className="h-12 w-12 shrink-0 rounded-md bg-plum-800" aria-hidden="true" />
          ) : (
            <Cover song={currentSong} className="h-12 w-12 shrink-0 rounded-md" />
          )}
          <div className="min-w-0" aria-live="polite">
            <p className="truncate text-sm font-semibold">{idle ? "Nothing playing" : currentSong.title}</p>
            <p className={`truncate text-xs ${playError ? "text-hibiscus-400" : "text-sand-500"}`}>
              {playError || (idle ? "Pick a track to start" : currentSong.artist)}
            </p>
          </div>
        </div>

        {/* Controls + seek */}
        <div className="col-span-2 row-start-2 flex flex-col items-center gap-1 md:col-span-1 md:col-start-2 md:row-start-1">
          <div className="hidden items-center gap-1 md:flex">
            <IconButton label="Shuffle" active={shuffle} onClick={toggleShuffle}>
              <Shuffle className="h-4 w-4" />
            </IconButton>
            <IconButton label="Previous track" onClick={prev} disabled={idle}>
              <SkipBack className="h-5 w-5" fill="currentColor" />
            </IconButton>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="mx-1 grid h-11 w-11 place-items-center rounded-full bg-marigold-400 text-plum-950 transition-transform hover:scale-105 hover:bg-marigold-300 active:scale-95"
            >
              {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
            </button>
            <IconButton label="Next track" onClick={next} disabled={idle}>
              <SkipForward className="h-5 w-5" fill="currentColor" />
            </IconButton>
            <IconButton label="Repeat current track" active={repeat} onClick={toggleRepeat}>
              <Repeat className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-9 text-right text-xs tabular-nums text-sand-500">{formatTime(time)}</span>
            <input
              type="range"
              className="range"
              aria-label="Seek"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(time, duration || 0)}
              disabled={!duration}
              style={{ "--pct": `${seekPct}%` }}
              onChange={(e) => seek(Number(e.target.value))}
            />
            <span className="w-9 text-xs tabular-nums text-sand-500">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mobile play + desktop volume */}
        <div className="flex items-center justify-end gap-2 md:col-start-3 md:row-start-1">
          <div className="flex items-center gap-1 md:hidden">
            <IconButton label="Previous track" onClick={prev} disabled={idle}>
              <SkipBack className="h-5 w-5" fill="currentColor" />
            </IconButton>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="grid h-10 w-10 place-items-center rounded-full bg-marigold-400 text-plum-950 active:scale-95"
            >
              {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
            </button>
            <IconButton label="Next track" onClick={next} disabled={idle}>
              <SkipForward className="h-5 w-5" fill="currentColor" />
            </IconButton>
          </div>

          <div className="hidden w-36 items-center gap-2 md:flex">
            <button
              type="button"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              className="text-sand-300 hover:text-sand-100"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              className="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              style={{ "--pct": `${volume * 100}%` }}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
