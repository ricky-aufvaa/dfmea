import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts', 'd3'],
          graph: ['cytoscape', 'react-cytoscapejs'],
          utils: ['lodash', 'uuid']
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (can be disabled in production)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'cytoscape',
      'react-cytoscapejs',
      'd3',
      'lodash',
      'uuid'
    ],
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },
})
