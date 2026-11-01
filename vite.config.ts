import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built app work on any host or sub-folder (Vercel, Netlify, GitHub Pages, cPanel).
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: { outDir: "dist", sourcemap: false },
});
