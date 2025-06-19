import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Critical for correct asset paths
  build: {
    outDir: 'dist', 
    assetsDir: 'assets',
  },
});