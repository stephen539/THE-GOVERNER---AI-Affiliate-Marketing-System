import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/ws": {
        target: "ws://localhost:5000",
        ws: true
      }
    }
  }
});
