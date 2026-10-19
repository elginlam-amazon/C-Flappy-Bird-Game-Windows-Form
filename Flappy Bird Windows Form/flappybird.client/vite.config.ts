import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Backend URL used by the dev-server proxy; override with ASPNETCORE_URL if the API runs elsewhere.
const apiTarget = process.env.ASPNETCORE_URL ?? 'http://localhost:5180';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    // The ASP.NET Core server hosts the production bundle from its wwwroot.
    outDir: '../FlappyBird.Server/wwwroot',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
  },
});
