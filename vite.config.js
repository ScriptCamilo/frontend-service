import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
  rollupInputOptions: {
    input: "src/index.jsx",
    plugins: [
      require("rollup-plugin-node-resolve")(),
      require("rollup-plugin-commonjs")(),
      require("rollup-plugin-replace")({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
    ],
  },
  rollupOutputOptions: {
    format: "es",
  },
});
