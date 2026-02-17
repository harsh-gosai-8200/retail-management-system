import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: "https://3371-43-241-193-128.ngrok-free.app",
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
