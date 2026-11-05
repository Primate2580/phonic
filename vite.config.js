import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Stop Vite from picking up a postcss.config.js from a parent folder
  css: { postcss: { plugins: [] } },
});