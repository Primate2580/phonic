import { fallbackCover } from "../lib/format";

export default function Cover({ song, className = "", ...rest }) {
  const fallback = fallbackCover(song?.title || song?.id || "phonic");
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
