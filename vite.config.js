import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        overview: resolve(__dirname, 'admin/overview/index.html'),
        deadline: resolve(__dirname, 'admin/deadline/index.html'),
      }
    }
  }
})