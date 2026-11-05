import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh bg-plum-950 text-sand-100 lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-plum-900 lg:block" aria-hidden="true">
        <div className="vinyl spin absolute -left-24 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2" style={{ animationDuration: "14s" }}>
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-marigold-400">
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plum-950" />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-10 inline-block" aria-label="Phonic home">
            <Logo />
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sand-300">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-sm text-sand-300">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-sand-300">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-plum-700 bg-plum-900 px-4 py-3 text-sand-100 placeholder-sand-500 transition-colors focus:border-marigold-400 focus:outline-none focus:ring-1 focus:ring-marigold-400"
        {...props}
      />
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg border border-hibiscus-400/40 bg-hibiscus-400/10 px-4 py-3 text-sm text-hibiscus-400">
      {children}
    </p>
  );
}
