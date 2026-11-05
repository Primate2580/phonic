import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { Field, FormError } from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { authMessage } from "../lib/format";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-marigold-400 hover:text-marigold-300">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => login(email.trim(), password));
        }}
      >
        <Field label="Email" id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <Field label="Password" id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
        <FormError>{error}</FormError>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold-400 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-60"
        >
          {busy && <Spinner />} Log in
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-sand-500">
        <span className="h-px flex-1 bg-plum-700" /> or <span className="h-px flex-1 bg-plum-700" />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => run(loginWithGoogle)}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-plum-600 py-3 font-semibold transition-colors hover:border-sand-500 disabled:opacity-60"
      >
        <GoogleIcon className="h-5 w-5" /> Continue with Google
      </button>
    </AuthLayout>
  );
}
