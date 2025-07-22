// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/gestor-proyectos/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Opciones del manifest
      manifest: {
        name: 'Gestor de Proyectos',
        short_name: 'Proyectos',
        description: 'Organiza tus ideas, proyectos y tareas en un solo lugar.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'Gestor-de-proyectos.png', // Usa el ícono que ya tienes en /public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})