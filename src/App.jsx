import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { PodcastProvider } from "./context/PodcastContext";
import { PlayerProvider } from "./context/PlayerContext";
import AppShell from "./components/AppShell";
import { PublicOnly, RequireAdmin, RequireAuth } from "./components/Routes";
import Admin from "./pages/Admin";
import Browse from "./pages/Browse";
import CategoryPage from "./pages/CategoryPage";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Liked from "./pages/Liked";
import Library from "./pages/Library";
import Login from "./pages/Login";
import PlaylistDetail from "./pages/PlaylistDetail";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import Podcasts from "./pages/Podcasts";
import ShowDetail from "./pages/ShowDetail";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PodcastProvider>
        <PlayerProvider>
         <LibraryProvider>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/home" element={<Home />} />
                <Route path="/liked" element={<Liked />} />
                <Route path="/library" element={<Library />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/browse/:type/:category" element={<CategoryPage />} />
                <Route path="/podcasts" element={<Podcasts />} />
                <Route path="/podcasts/:showId" element={<ShowDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
                <Route element={<RequireAdmin />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
         </LibraryProvider>
        </PlayerProvider>
        </PodcastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
