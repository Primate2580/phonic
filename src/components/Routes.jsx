import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export function Splash() {
  return (
    <div className="grid h-dvh place-items-center bg-plum-950">
      <div className="flex flex-col items-center gap-4">
        <div className="vinyl spin h-16 w-16" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

/** Only signed-in users get through. */
export function RequireAuth() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login, signup and landing bounce signed-in users straight to the library. */
export function PublicOnly() {
  const { user, initializing } = useAuth();
  if (initializing) return <Splash />;
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}

/** Only the admin account gets through. This is a UI guard; Firestore rules enforce it for real. */
export function RequireAdmin() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-24 text-center">
        <Logo />
        <h1 className="font-display text-2xl font-semibold">Admins only</h1>
        <p className="text-sand-300">
          This account can listen but can't upload or remove tracks. Log in with the admin account to manage the library.
        </p>
      </div>
    );
  }
  return <Outlet />;
}
