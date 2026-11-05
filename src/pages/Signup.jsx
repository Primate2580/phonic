import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { Field, FormError } from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { authMessage } from "../lib/format";

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("The two passwords don't match.");
      return;
    }
    run(() => signup({ username: form.username.trim(), email: form.email.trim(), password: form.password }));
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a minute, then you can listen."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-marigold-400 hover:text-marigold-300">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Username" id="username" type="text" autoComplete="nickname" required minLength={2} maxLength={30} value={form.username} onChange={set("username")} placeholder="What should we call you?" />
        <Field label="Email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
        <Field label="Password" id="password" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={set("password")} placeholder="At least 6 characters" />
        <Field label="Confirm password" id="confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={set("confirm")} placeholder="Type it again" />
        <FormError>{error}</FormError>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-marigold-400 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300 disabled:opacity-60"
        >
          {busy && <Spinner />} Create account
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
        <GoogleIcon className="h-5 w-5" /> Sign up with Google
      </button>
    </AuthLayout>
  );
}
