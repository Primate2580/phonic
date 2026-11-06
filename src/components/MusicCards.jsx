import { Link } from "react-router-dom";
import { albumPath, artistPath, coverSong } from "../lib/catalog";
import Cover from "./Cover";
import PlaylistArt from "./PlaylistArt";

const count = (n) => `${n} ${n === 1 ? "track" : "tracks"}`;

export function ArtistCard({ artist }) {
  return (
    <Link to={artistPath(artist.name)} className="group block text-center">
      <PlaylistArt songs={artist.songs} className="mx-auto aspect-square w-full rounded-full shadow-lg shadow-black/40 transition-transform group-hover:-translate-y-0.5" />
      <p className="mt-3 truncate text-sm font-semibold group-hover:text-marigold-400">{artist.name}</p>
      <p className="text-sm text-sand-500">{count(artist.songs.length)}</p>
    </Link>
  );
}

export function AlbumCard({ album }) {
  return (
    <Link to={albumPath(album.artist, album.title)} className="group block">
      <Cover song={coverSong(album.songs)} className="aspect-square w-full rounded-md shadow-lg shadow-black/40 transition-transform group-hover:-translate-y-0.5" />
      <p className="mt-3 truncate text-sm font-semibold group-hover:text-marigold-400">{album.title}</p>
      <p className="truncate text-sm text-sand-500">{album.artist}, {count(album.songs.length)}</p>
    </Link>
  );
}
