import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    watch: {
      usePolling: true, // <--- ESTA ES LA LÍNEA MÁGICA
    },
    host: true, // Esto asegura que sea accesible desde fuera del contenedor
    strictPort: true,
    port: 5173,
  },
})