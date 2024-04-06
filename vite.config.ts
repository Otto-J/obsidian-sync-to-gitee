// import path from "path";
import { defineConfig } from "vite";
import builtins from "builtin-modules";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import path from "path";

import fs from "fs/promises";
import manifest from "./manifest.json";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
const env = dotenv.config();
dotenvExpand.expand(env);

const isWatch = process.argv.includes("--watch");

export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      {
        name: "postbuild-commands",
        async closeBundle() {
          await fs.copyFile(
            path.resolve("./manifest.json"),
            path.resolve("./dist/manifest.json")
          );
          if (!isWatch) return;

          if (!process.env.OB_PLUGIN_DIST) {
            console.log(
              "为了更好的开发体验，你可以在 .env 中配置 OB_PLUGIN_DIST"
            );
            return;
          }
          const dist = process.env.OB_PLUGIN_DIST + manifest.id + "-dev2";

          // keep dist folder exists
          try {
            await fs.access(dist);
          } catch (error) {
            await fs.mkdir(dist);
          }

          const copy = async (src: string, dist: string) => {
            await fs.copyFile(
              path.resolve("./dist", src),
              path.resolve(dist, src)
            );
          };

          // do something

          // copy file
          await Promise.all([
            await copy("./main.js", dist),
            await copy("./styles.css", dist),
            await copy("./manifest.json", dist),
            await copy("./versions.json", dist),
            await fs.copyFile(
              path.resolve("./.hotreload"),
              path.resolve(dist, ".hotreload")
            ),
          ]);
          console.log("复制结果到", dist);
        },
      },
    ],
    build: {
      target: "esnext",
      sourcemap: isWatch ? "inline" : false,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
      lib: {
        entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
        formats: ["cjs"],
      },
      css: {},
      rollupOptions: {
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
          exports: "named",
        },
        external: [
          "obsidian",
          "electron",
          "codemirror",
          "@codemirror/autocomplete",
          "@codemirror/closebrackets",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/comment",
          "@codemirror/fold",
          "@codemirror/gutter",
          "@codemirror/highlight",
          "@codemirror/history",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/matchbrackets",
          "@codemirror/panel",
          "@codemirror/rangeset",
          "@codemirror/rectangular-selection",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/stream-parser",
          "@codemirror/text",
          "@codemirror/tooltip",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/lr",
          "@lezer/highlight",
          ...builtins,
        ],
      },
      // Use root as the output dir
      emptyOutDir: false,
      outDir: "./dist",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
