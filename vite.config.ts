import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Support top-level await if needed
  },
  optimizeDeps: {
    include: ['pdfjs-dist'], // Ensure pdfjs-dist is pre-bundled correctly
  }
});