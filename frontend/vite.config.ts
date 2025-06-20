import {defineConfig} from 'vite';
import { resolve } from "path";

export default defineConfig({
  base: "/frontend/",
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "html/root.html"),
        admin: resolve(__dirname, "html/admin.html"),
        login: resolve(__dirname, "html/login.html"),
        register: resolve(__dirname, "html/register.html"),
        timetable: resolve(__dirname, "html/timetable.html"),
      },
    },
  },
});