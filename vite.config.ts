import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Server mode (no JELLYFIN_API_KEY): forward /api to the backend during development.
    proxy: {
      "/api": process.env.WRAPPED_SERVER_URL ?? "http://localhost:3000",
    },
  },
});
