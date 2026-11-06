export function formatTime(secs) {
  if (!Number.isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  return 0;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** A generated sleeve for tracks with no (or a broken) cover image. Replaces the dead via.placeholder.com links. */
export function fallbackCover(seed = "") {
  let h = 0;
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = h % 360;
  const b = (a + 40) % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${a} 42% 28%)'/><stop offset='1' stop-color='hsl(${b} 50% 13%)'/></linearGradient></defs>` +
    `<rect width='200' height='200' fill='url(#g)'/>` +
    `<circle cx='100' cy='100' r='62' fill='none' stroke='hsl(${a} 55% 72%)' stroke-opacity='.3' stroke-width='2'/>` +
    `<circle cx='100' cy='100' r='38' fill='none' stroke='hsl(${a} 55% 72%)' stroke-opacity='.22' stroke-width='2'/>` +
    `<circle cx='100' cy='100' r='9' fill='#f6b93b'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function authMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match. Check them and try again.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Log in instead.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Can't reach the server. Check your connection.";
    case "auth/unauthorized-domain":
      return "This site's domain isn't authorised in Firebase. Add it under Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled in the Firebase console yet.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google pop-up. Allow pop-ups for this site and try again.";
    default:
      return "Something went wrong. Try again.";
  }
}

export function formatDate(value) {
  const ms = toMillis(value);
  if (!ms) return "";
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
