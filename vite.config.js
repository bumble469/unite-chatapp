import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Unite',
        short_name: 'Unite',
        description: 'Real-time chat web app with private chats and public and private rooms.',
        theme_color: 'rgb(25, 118, 210)',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/unite-logo.jpeg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: '/icons/unite-logo.jpeg',
            sizes: '512x512',
            type: 'image/jpg'
          }
        ]
      }
    })
  ]
});
