import { useMemo } from "react";
import CategoryTile from "../components/CategoryTile";
import { AlbumCard, ArtistCard } from "../components/MusicCards";
import { usePlayer } from "../context/PlayerContext";
import { usePodcasts } from "../context/PodcastContext";
import { groupAlbums, groupArtists } from "../lib/catalog";

function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const name = (item[key] || "").trim();
    if (name) map.set(name, (map.get(name) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default function Browse() {
  const { songs, songsLoading } = usePlayer();
  const { shows, ready } = usePodcasts();
  const music = useMemo(() => countBy(songs, "category"), [songs]);
  const podcasts = useMemo(() => countBy(shows, "category"), [shows]);
  const artists = useMemo(() => groupArtists(songs), [songs]);
  const albums = useMemo(() => groupAlbums(songs), [songs]);
  const loading = songsLoading || !ready;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Browse</h1>

      {loading ? (
        <p className="mt-8 text-sand-300">Loading…</p>
      ) : music.length === 0 && podcasts.length === 0 && artists.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-plum-600 p-10 text-center">
          <p className="font-display text-lg font-semibold">Nothing to browse yet</p>
          <p className="mt-2 text-sand-300">Categories appear here once songs or podcasts are given one.</p>
        </div>
      ) : (
        <>
          {music.length > 0 && (
            <section className="mt-8" aria-labelledby="music-cats">
              <h2 id="music-cats" className="font-display text-xl font-semibold">Music genres</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {music.map(([name, count]) => (
                  <CategoryTile key={name} to={`/browse/music/${encodeURIComponent(name)}`} name={name} count={count} unit="track" />
                ))}
              </div>
            </section>
          )}
          {artists.length > 0 && (
            <section className="mt-12" aria-labelledby="artists-title">
              <h2 id="artists-title" className="font-display text-xl font-semibold">Artists</h2>
              <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {artists.map((artist) => (
                  <ArtistCard key={artist.key} artist={artist} />
                ))}
              </div>
            </section>
          )}
          {albums.length > 0 && (
            <section className="mt-12" aria-labelledby="albums-title">
              <h2 id="albums-title" className="font-display text-xl font-semibold">Albums</h2>
              <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
                {albums.map((album) => (
                  <AlbumCard key={album.key} album={album} />
                ))}
              </div>
            </section>
          )}
          {podcasts.length > 0 && (
            <section className="mt-12" aria-labelledby="pod-cats">
              <h2 id="pod-cats" className="font-display text-xl font-semibold">Podcast categories</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {podcasts.map(([name, count]) => (
                  <CategoryTile key={name} to={`/browse/podcasts/${encodeURIComponent(name)}`} name={name} count={count} unit="show" />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
