import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the domain root on Vercel (was "/Worksphere/" for GitHub Pages)
export default defineConfig({
  base: "/",
  plugins: [react()],
});
