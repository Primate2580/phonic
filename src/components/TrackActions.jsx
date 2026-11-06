import { Heart, ListPlus } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";

// `reveal` hides the button on desktop until the card is hovered or focused
// (it always shows on touch screens, and always shows once a song is liked).
const reveal = "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100";

export function LikeButton({ songId, title = "", reveal: hideUntilHover = false, className = "" }) {
  const { likedIds, toggleLike } = useLibrary();
  const liked = likedIds.has(songId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleLike(songId);
      }}
      aria-pressed={liked}
      aria-label={liked ? `Remove ${title || "song"} from liked songs` : `Like ${title || "song"}`}
      title={liked ? "Remove from liked songs" : "Like"}
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
        liked ? "text-marigold-400" : "text-sand-300 hover:text-sand-100"
      } ${hideUntilHover && !liked ? reveal : ""} ${className}`}
    >
      <Heart className="h-[18px] w-[18px]" fill={liked ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}

export function AddToPlaylistButton({ song, reveal: hideUntilHover = false, className = "" }) {
  const { openPicker } = useLibrary();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openPicker(song);
      }}
      aria-label={`Add ${song.title} to a playlist`}
      title="Add to playlist"
      className={`grid h-9 w-9 place-items-center rounded-full text-sand-300 transition-colors hover:text-sand-100 ${
        hideUntilHover ? reveal : ""
      } ${className}`}
    >
      <ListPlus className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}
