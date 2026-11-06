// Artists and albums are not stored anywhere. They are worked out from the songs,
// matching names ignoring capitals and extra spaces.
export const norm = (s) => (s || "").trim().toLowerCase();

export const artistPath = (name) => `/artists/${encodeURIComponent((name || "").trim())}`;
export const albumPath = (artist, album) =>
  `/albums/${encodeURIComponent((artist || "").trim())}/${encodeURIComponent((album || "").trim())}`;

/** [{ key, name, songs }] sorted by name. */
export function groupArtists(songs) {
  const map = new Map();
  for (const s of songs) {
    const key = norm(s.artist);
    if (!key) continue;
    if (!map.has(key)) map.set(key, { key, name: s.artist.trim(), songs: [] });
    map.get(key).songs.push(s);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** [{ key, title, artist, songs }] sorted by title. Songs without an album are skipped. */
export function groupAlbums(songs) {
  const map = new Map();
  for (const s of songs) {
    const album = norm(s.album);
    const artist = norm(s.artist);
    if (!album || !artist) continue;
    const key = `${artist}|${album}`;
    if (!map.has(key)) map.set(key, { key, title: s.album.trim(), artist: s.artist.trim(), songs: [] });
    map.get(key).songs.push(s);
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title));
}

/** Pick a song that has real artwork if there is one, so cards don't show the generated sleeve needlessly. */
export const coverSong = (songs) => songs.find((s) => s.coverURL) || songs[0];
