import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// ASP.NET backend URL used by the dev-server proxy (see FlappyBird.Server/Properties/launchSettings.json).
const apiTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    // The ASP.NET backend serves the production bundle from its wwwroot.
    outDir: '../FlappyBird.Server/wwwroot',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
  },
});
