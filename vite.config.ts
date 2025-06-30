import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@safe-globalThis/safe-apps-sdk'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wagmi', 'viem'],
          web3: ['@rainbow-me/rainbowkit'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
      '@safe-global/safe-apps-sdk'  
    ],
  },
});