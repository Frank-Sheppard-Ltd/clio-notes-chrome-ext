import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    {
      name: 'redirect-to-app',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/') {
            res.writeHead(302, { Location: '/app.html' });
            res.end();
          } else {
            next();
          }
        });
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, "app.html"),
        background: resolve(__dirname, "src/background.js")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
