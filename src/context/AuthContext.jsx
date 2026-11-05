import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { ADMIN_EMAIL } from "../lib/config";

const AuthContext = createContext(null);

// Make sure every signed-in user has a profile document (covers Google sign-in
// and accounts whose profile write failed during signup).
async function ensureProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const data = {
    uid: user.uid,
    email: user.email || "",
    photoURL: user.photoURL || "",
    createdAt: serverTimestamp(),
  };
  if (user.displayName) data.username = user.displayName;
  await setDoc(ref, data, { merge: true });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (next) => {
        setUser(next);
        setInitializing(false);
        if (!next) setProfile(null);
        else ensureProfile(next).catch((e) => console.warn("Could not create profile:", e));
      }),
    [],
  );

  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db, "users", uid),
      (snap) => setProfile(snap.exists() ? snap.data() : null),
      (e) => console.warn("Could not read profile:", e),
    );
  }, [uid]);

  const signup = useCallback(async ({ username, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    try {
      await setDoc(
        doc(db, "users", cred.user.uid),
        { uid: cred.user.uid, username, email, photoURL: "", createdAt: serverTimestamp() },
        { merge: true },
      );
    } catch (e) {
      // The account exists; the profile is recreated by ensureProfile next time.
      console.warn("Could not save profile:", e);
    }
  }, []);

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") return;
      throw e;
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const saveAvatar = useCallback(async (url) => {
    const current = auth.currentUser;
    if (!current) throw new Error("Not signed in.");
    await updateProfile(current, { photoURL: url });
    await setDoc(
      doc(db, "users", current.uid),
      { photoURL: url, updatedAt: serverTimestamp() },
      { merge: true },
    );
    setProfile((p) => ({ ...(p || {}), photoURL: url }));
  }, []);

  const value = useMemo(() => {
    const email = user?.email || "";
    return {
      user,
      profile,
      initializing,
      isAdmin: !!ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL,
      displayName: profile?.username || user?.displayName || email.split("@")[0] || "there",
      photoURL: profile?.photoURL || user?.photoURL || "",
      signup,
      login,
      loginWithGoogle,
      logout,
      saveAvatar,
    };
  }, [user, profile, initializing, signup, login, loginWithGoogle, logout, saveAvatar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
