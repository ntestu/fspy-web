import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
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
