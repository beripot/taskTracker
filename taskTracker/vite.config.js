import { defineConfig } from 'vite'
import react from '@vitejs/react-refresh'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_REPOSITORY_NAME/', // e.g., /efficiency-tracker/
})