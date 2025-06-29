import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  },
})