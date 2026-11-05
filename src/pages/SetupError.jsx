export default function SetupError({ missing }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-plum-950 p-6 text-sand-100">
      <div className="w-full max-w-lg rounded-2xl border border-plum-700 bg-plum-900 p-8">
        <h1 className="font-display text-2xl font-semibold">Setup needed</h1>
        <p className="mt-3 text-sand-300">
          Phonic can't start because some settings are missing. Copy <code className="rounded bg-plum-800 px-1.5 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-plum-800 px-1.5 py-0.5">.env</code>, fill in these values, then restart <code className="rounded bg-plum-800 px-1.5 py-0.5">npm run dev</code>:
        </p>
        <ul className="mt-4 space-y-1 font-mono text-sm text-marigold-300">
          {missing.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
