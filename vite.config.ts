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
          if (
            id.includes('/src/features/admin/AdminDashboard') ||
            id.includes('/src/features/admin/components/')
          ) {
            return 'feature-admin';
          }
          if (id.includes('/src/simulations/')) {
            return 'feature-simulations';
          }
          if (id.includes('/src/data/seeds/')) {
            return 'data-seeds';
          }
          if (
            id.includes('/src/data/mindMapsCatalog') ||
            id.includes('/src/data/vectors/')
          ) {
            return 'catalog-science';
          }
          if (
            id.includes('/src/data/stickersCatalog') ||
            id.includes('/src/data/bannerFramesCatalog')
          ) {
            return 'catalog-stickers';
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
