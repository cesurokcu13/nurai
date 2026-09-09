import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nurai/', // Correct base path for https://cesurokcu13.github.io/nurai/
})
