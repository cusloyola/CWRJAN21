import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: ['devcwr.local', '192.168.192.252', 'stagingcwr.local', 'localhost','stagingcwr.wallem.net.ph'], 
  },
})
