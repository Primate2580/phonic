import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import PlaylistArt from "../components/PlaylistArt";
import ShowCard from "../components/ShowCard";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";

function Heading({ id, children, to, linkText }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 id={id} className="font-display text-xl font-semibold">{children}</h2>
      {to && (
        <Link to={to} className="text-sm font-semibold text-marigold-400 hover:text-marigold-300">{linkText}</Link>
      )}
    </div>
  );
}

export default function Library() {
  const { likes, playlists } = useLibrary();
  const { songs } = usePlayer();
  const { shows, followedIds } = usePodcasts();

  const byId = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);
  const followed = useMemo(() => shows.filter((s) => followedIds.has(s.id)), [shows, followedIds]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Your library</h1>

      <Link
        to="/liked"
        className="mt-6 flex max-w-md items-center gap-4 rounded-2xl bg-gradient-to-br from-marigold-500 to-hibiscus-400 p-5 text-plum-950 transition-transform hover:-translate-y-0.5"
      >
        <Heart className="h-9 w-9" fill="currentColor" aria-hidden="true" />
        <span>
          <span className="block font-display text-lg font-semibold">Liked songs</span>
          <span className="text-sm opacity-80">{likes.length} {likes.length === 1 ? "track" : "tracks"}</span>
        </span>
      </Link>

      <section className="mt-12" aria-labelledby="lib-playlists">
        <Heading id="lib-playlists" to="/playlists" linkText="See all and create">Playlists</Heading>
        {playlists.length === 0 ? (
          <p className="mt-4 text-sand-300">
            No playlists yet.{" "}
            <Link to="/playlists" className="font-semibold text-marigold-400 hover:text-marigold-300">Create one</Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {playlists.slice(0, 5).map((pl) => {
              const tracks = (pl.songIds || []).map((id) => byId.get(id)).filter(Boolean);
              return (
                <Link key={pl.id} to={`/playlists/${pl.id}`} className="group block">
                  <PlaylistArt songs={tracks} className="aspect-square w-full rounded-md shadow-lg shadow-black/40" />
                  <p className="mt-3 truncate text-sm font-semibold group-hover:text-marigold-400">{pl.name}</p>
                  <p className="text-sm text-sand-500">{tracks.length} {tracks.length === 1 ? "track" : "tracks"}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12" aria-labelledby="lib-podcasts">
        <Heading id="lib-podcasts" to="/podcasts" linkText="Find podcasts">Podcasts you follow</Heading>
        {followed.length === 0 ? (
          <p className="mt-4 text-sand-300">
            You aren't following any shows. Open a podcast and press Follow to keep it here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {followed.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
