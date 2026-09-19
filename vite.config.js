import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.js.org/config/
export default defineConfig({
  base: '/nexus/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173
  }
});
