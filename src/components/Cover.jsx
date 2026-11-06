import { fallbackCover } from "../lib/format";

export default function Cover({ song, className = "", ...rest }) {
  // Episodes without their own cover use the show's colour, so they match the show's artwork.
  const seed = song?.kind === "episode" ? song.album || song.title : song?.title || song?.id;
  const fallback = fallbackCover(seed || "phonic");
  return (
    <img
      src={song?.coverURL || fallback}
      alt=""
      loading="lazy"
      draggable="false"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = fallback;
      }}
      className={`bg-plum-800 object-cover ${className}`}
      {...rest}
    />
  );
}
