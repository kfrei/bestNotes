import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep manualChunks strictly for pure vendor libraries & static seeds.
          // Dynamic import() boundaries (Admin, Landing, LiveTV, PDF/Drive, Library Catalogs, Simulations)
          // are split automatically by Rollup so shared helpers stay in the entry chunk and
          // lazy chunks NEVER leak into <link rel="modulepreload"> on startup!
          if (id.includes('/src/data/seeds/')) {
            return 'data-seeds';
          }
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'vendor-firebase';
          }
          if (
            id.includes('node_modules/pdfjs-dist/') ||
            id.includes('node_modules/jspdf/') ||
            id.includes('node_modules/jszip/')
          ) {
            return 'vendor-pdf-zip';
          }
          if (id.includes('node_modules/katex/')) {
            return 'vendor-math';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
