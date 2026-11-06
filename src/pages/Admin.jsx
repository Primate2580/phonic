import { useState } from "react";
import AdminPodcasts from "./admin/AdminPodcasts";
import AdminSongs from "./admin/AdminSongs";

const TABS = [
  ["songs", "Songs"],
  ["podcasts", "Podcasts"],
];

export default function Admin() {
  const [tab, setTab] = useState("songs");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Manage content</h1>
      <p className="mt-2 text-sand-300">Anything you publish appears for every listener right away.</p>

      <div role="tablist" aria-label="Content type" className="mt-6 inline-flex rounded-full bg-plum-800 p-1">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
              tab === id ? "bg-marigold-400 text-plum-950" : "text-sand-300 hover:text-sand-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === "songs" ? <AdminSongs /> : <AdminPodcasts />}
      </div>
    </div>
  );
}
