import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { configProblems } from "./lib/config";

async function boot() {
  const root = createRoot(document.getElementById("root"));

  // Load Firebase only when the settings exist, otherwise it throws before anything renders.
  if (configProblems.length) {
    const { default: SetupError } = await import("./pages/SetupError.jsx");
    root.render(<SetupError missing={configProblems} />);
    return;
  }

  const { default: App } = await import("./App.jsx");
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
