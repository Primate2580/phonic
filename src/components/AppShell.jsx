import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { House, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AvatarModal from "./AvatarModal";
import Logo from "./Logo";
import PlayerBar from "./PlayerBar";

const PROMPT_KEY = "phonic:avatar-prompt-dismissed";

function Avatar({ src, name, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Change profile photo"
      title="Change profile photo"
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-plum-700 font-display text-sm font-semibold ring-1 ring-plum-600 transition hover:ring-marigold-400"
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
    </button>
  );
}

function NavItem({ to, icon: Icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? "bg-plum-800 text-marigold-400" : "text-sand-300 hover:bg-plum-800/60 hover:text-sand-100"
        }`
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {children}
    </NavLink>
  );
}

export default function AppShell() {
  const { displayName, photoURL, isAdmin, logout, profile } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Offer a profile photo once per session, after we know the profile has none.
  useEffect(() => {
    if (!profile || photoURL) return;
    try {
      if (sessionStorage.getItem(PROMPT_KEY)) return;
    } catch {
      /* storage unavailable */
    }
    setAvatarOpen(true);
  }, [profile, photoURL]);

  function closeAvatar() {
    setAvatarOpen(false);
    try {
      sessionStorage.setItem(PROMPT_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-plum-950 text-sand-100">
      <div className="flex min-h-0 flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-plum-800 bg-plum-900/60 p-4 md:flex">
          <div className="px-3 py-3">
            <Logo />
          </div>
          <nav className="mt-6 flex flex-col gap-1" aria-label="Main">
            <NavItem to="/home" icon={House}>Listen</NavItem>
            {isAdmin && (
              <NavItem to="/admin" icon={ShieldCheck}>Manage tracks</NavItem>
            )}
          </nav>
          <div className="mt-auto flex items-center gap-3 rounded-xl bg-plum-800/60 p-3">
            <Avatar src={photoURL} name={displayName} onClick={() => setAvatarOpen(true)} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <button type="button" onClick={logout} className="flex items-center gap-1 text-xs text-sand-500 hover:text-sand-100">
                <LogOut className="h-3 w-3" aria-hidden="true" /> Log out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header (mobile) */}
          <header className="flex items-center justify-between border-b border-plum-800 px-4 py-3 md:hidden">
            <Logo />
            <div className="flex items-center gap-1">
              {isAdmin && (
                <NavLink to="/admin" aria-label="Manage tracks" className="grid h-10 w-10 place-items-center rounded-full text-sand-300 hover:text-marigold-400">
                  <ShieldCheck className="h-5 w-5" />
                </NavLink>
              )}
              <button type="button" onClick={logout} aria-label="Log out" className="grid h-10 w-10 place-items-center rounded-full text-sand-300 hover:text-sand-100">
                <LogOut className="h-5 w-5" />
              </button>
              <Avatar src={photoURL} name={displayName} onClick={() => setAvatarOpen(true)} />
            </div>
          </header>

          <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <PlayerBar />
      {avatarOpen && <AvatarModal onClose={closeAvatar} />}
    </div>
  );
}
