// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const apiTarget = isProduction ? 'http://backend:8080' : 'http://localhost:8080';
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // Make API base URL available as global constants
      '__API_BASE_URL__': JSON.stringify(apiTarget),
    },
  };
});
