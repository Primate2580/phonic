import { Link } from "react-router-dom";
import Logo from "../components/Logo";

export default function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-plum-950 text-sand-100">
      {/* The record: the one memorable thing on the page */}
      <div
        className="vinyl spin pointer-events-none absolute -right-40 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 opacity-90 sm:-right-24 lg:right-[6%] lg:h-[46rem] lg:w-[46rem]"
        style={{ animationDuration: "16s" }}
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-marigold-400">
          <div className="absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum-950" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-plum-950 from-35% via-plum-950/50 via-55% to-transparent" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <Logo />
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-sand-300 hover:text-sand-100">
            Log in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-16">
          <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Press play on something good.
          </h1>
          <p className="mt-6 max-w-md text-lg text-sand-300">
            Phonic is a small library of songs, picked and uploaded by hand. Sign up and the first track is already waiting.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-full bg-marigold-400 px-7 py-3 font-semibold text-plum-950 transition-colors hover:bg-marigold-300"
            >
              Create an account
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-plum-600 px-7 py-3 font-semibold text-sand-100 transition-colors hover:border-sand-500"
            >
              Log in
            </Link>
          </div>
          <p className="mt-12 text-sm text-sand-500">Enjoy music like an African man banku.</p>
        </main>
      </div>
    </div>
  );
}
