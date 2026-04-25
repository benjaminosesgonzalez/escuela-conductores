import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // <--- ESTA ES LA LÍNEA MÁGICA
    },
    host: true, // Esto asegura que sea accesible desde fuera del contenedor
    strictPort: true,
    port: 5173,
  },
})