import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for GitHub Pages deployment
  // Set to '/' for custom domain or '/repo-name/' for github.io/repo-name
  base: process.env.GITHUB_PAGES ? '/beta-manager/' : '/',
})
