import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@xenova/transformers') || id.includes('onnxruntime')) {
            return 'ai-runtime';
          }

          if (id.includes('@react-three') || id.includes('/three/')) {
            return 'three-vendor';
          }

          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }

          if (id.includes('react-router-dom') || id.includes('framer-motion')) {
            return 'app-vendor';
          }

          return undefined;
        },
      },
    },
  },
});
