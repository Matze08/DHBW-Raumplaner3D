import {defineConfig} from 'vite';
import { resolve } from "path";

export default defineConfig({
  base: "./",
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "html/root.html"),
        admin: resolve(__dirname, "html/admin.html"),
        login: resolve(__dirname, "html/login.html"),
        register: resolve(__dirname, "html/register.html"),
        timetable: resolve(__dirname, "html/timetable.html"),
      },
      output: {
        entryFileNames: "[name]-[hash].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          // For HTML files, put them at root level without the html/ prefix
          if (assetInfo.name && assetInfo.name.endsWith(".html")) {
            return "[name].[ext]";
          }
          return "[name]-[hash].[ext]";
        },
      },
    },
    assetsDir: "", // Put assets at root level instead of in 'assets' folder
  },
});