import { reactRouter } from "@react-router/dev/vite"
import autoprefixer from "autoprefixer"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { dynamicImagesPlugin } from "./app/dynamic-images-vite-plugin"

const BACKEND_BASE_URL = process.env.VITE_API_BASE || "http://127.0.0.1:8000"

const backendProxy = {
  target: BACKEND_BASE_URL,
}
export default defineConfig({
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [dynamicImagesPlugin(), reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      "/events": {
        target: BACKEND_BASE_URL,
        rewrite: () => "/api/v1/events",
      },
      "/cache/": backendProxy,
      "/api/": backendProxy,
      "/avatar.random.png": backendProxy,
      "/avatar.png": backendProxy,
    },
  },
})
