import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import legacy from "@vitejs/plugin-legacy";
// import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ filename: "bundle-stats.html", open: false }),
    viteCompression({ algorithm: "brotliCompress", threshold: 1024 }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    // ViteImageOptimizer({
    //   png: { quality: 85 },
    //   jpeg: { quality: 85 },
    //   webp: { quality: 80 },
    //   avif: { quality: 75 },
    // }),
  ],
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          vendor: ["react-router-dom"],
        },
      },
    },
  },

  server: {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  },
});
