import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import { PlayerProvider } from "./context/PlayerContext";
import AppShell from "./components/AppShell";
import { PublicOnly, RequireAdmin, RequireAuth } from "./components/Routes";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Liked from "./pages/Liked";
import Login from "./pages/Login";
import PlaylistDetail from "./pages/PlaylistDetail";
import Playlists from "./pages/Playlists";
import Signup from "./pages/Signup";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}
