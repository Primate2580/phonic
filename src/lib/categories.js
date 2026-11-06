// Add or rename categories here. Songs and shows store the category name as plain text,
// so renaming one means updating the items that already use it.
export const SONG_CATEGORIES = [
  "Afrobeats",
  "Amapiano",
  "Hip-hop",
  "R&B",
  "Pop",
  "Gospel",
  "Highlife",
  "Reggae",
  "Jazz",
  "Rock",
  "Other",
];

export const PODCAST_CATEGORIES = [
  "Comedy",
  "News",
  "Education",
  "Technology",
  "Business",
  "Faith",
  "Culture",
  "Sports",
  "Storytelling",
  "Other",
];

/** A stable gradient per category name, so each category always looks the same. */
export function categoryGradient(name = "") {
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = h % 360;
  const b = (a + 45) % 360;
  return `linear-gradient(135deg, hsl(${a} 48% 32%), hsl(${b} 55% 16%))`;
}
