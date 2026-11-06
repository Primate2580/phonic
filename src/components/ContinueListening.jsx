import { useMemo } from "react";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";
import EpisodeRow from "./EpisodeRow";

/** Unfinished podcast episodes, most recent first. Renders nothing when there are none. */
export default function ContinueListening({ className = "mt-10" }) {
  const { continueListening } = usePodcasts();
  const { currentSong, isPlaying, play } = usePlayer();
  const items = useMemo(() => continueListening.slice(0, 3), [continueListening]);
  const queue = useMemo(() => items.map((i) => i.episode), [items]);

  if (items.length === 0) return null;
  return (
    <section className={className} aria-labelledby="continue-title">
      <h2 id="continue-title" className="font-display text-xl font-semibold">Continue listening</h2>
      <ul className="mt-3 divide-y divide-plum-800">
        {items.map(({ episode, progress }) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            progress={progress}
            showName
            isCurrent={currentSong?.id === episode.id}
            isPlaying={isPlaying}
            onPlay={(e) => play(e.id, queue)}
          />
        ))}
      </ul>
    </section>
  );
}
