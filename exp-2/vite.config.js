import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {}, // ignore any postcss/tailwind config files in parent folders
  },
});
