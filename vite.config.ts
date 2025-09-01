import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '', // Not using "/" to allow deployments on a subpath, e.g. on GitHub Pages
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          konva: ['react-konva'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  plugins: [react()],
  publicDir: 'assets/electron',
  server: {
    open: true,
  },
})
