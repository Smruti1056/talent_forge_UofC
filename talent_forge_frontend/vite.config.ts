import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/static/', // important: matches Django's STATIC_URL
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: '/src/main.tsx',
      output: {
        entryFileNames: 'main.js' // 🟢 No hashed name
      }
    }
  }
}); 