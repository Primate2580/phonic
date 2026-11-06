import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { usePlayer, usePlayerTime } from "../context/PlayerContext";
import { formatTime } from "../lib/format";
import Cover from "./Cover";
import { LikeButton } from "./TrackActions";

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

  const playButton = (
    <button
      type="button"
      onClick={toggle}
      aria-label={isPlaying ? "Pause" : "Play"}
      className="mx-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-marigold-400 text-plum-950 transition-transform hover:scale-105 hover:bg-marigold-300 active:scale-95"
    >
      {isPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" />}
    </button>
  );

  return (
    <footer className="border-t border-plum-700/70 bg-plum-900 px-4 py-2 md:px-6 md:py-3 short:py-1.5">
      <div className="player">
        {/* Track */}
        <div className="player-info flex min-w-0 items-center gap-3">
          {idle ? (
            <div className="h-12 w-12 shrink-0 rounded-md bg-plum-800 short:h-10 short:w-10" aria-hidden="true" />
          ) : (
            <Cover song={currentSong} className="h-12 w-12 shrink-0 rounded-md short:h-10 short:w-10" />
          )}
          <div className="min-w-0 flex-1 md:max-w-[16rem] md:flex-none" aria-live="polite">
            <p className="truncate text-sm font-semibold">{idle ? "Nothing playing" : currentSong.title}</p>
            <p className={`truncate text-xs ${playError ? "text-hibiscus-400" : "text-sand-500"}`}>
              {playError || (idle ? "Pick a track to start" : currentSong.artist)}
            </p>
          </div>
          {!idle && currentSong.kind !== "episode" && <LikeButton songId={currentSong.id} title={currentSong.title} className="shrink-0" />}
        </div>

        {/* Transport controls: the same on every screen size */}
        <div className="player-controls flex items-center justify-center gap-1">
          <IconButton label="Shuffle" active={shuffle} onClick={toggleShuffle}>
            <Shuffle className="h-4 w-4" />
          </IconButton>
          <IconButton label="Previous track" onClick={prev} disabled={idle}>
            <SkipBack className="h-5 w-5" fill="currentColor" />
          </IconButton>
          {playButton}
          <IconButton label="Next track" onClick={next} disabled={idle}>
            <SkipForward className="h-5 w-5" fill="currentColor" />
          </IconButton>
          <IconButton label="Repeat current track" active={repeat} onClick={toggleRepeat}>
            <Repeat className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Seek */}
        <div className="player-seek flex w-full items-center gap-3">
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

        {/* Volume (desktop only; phones use the device buttons) */}
        <div className="player-volume items-center justify-end gap-2">
          <div className="flex w-36 items-center gap-2">
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
