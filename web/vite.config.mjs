import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy'

const distDir = '';

export default defineConfig({
  root: 'src',
  publicDir: 'public',
  base: distDir,
  build: {
    rollupOptions: {
      input: {
        main: 'src/index.html',
        playground: 'src/playground.html'
      }
    },
    outDir: '../templates',
    emptyOutDir: true,
  },
  plugins: [
    legacy({
      targets: ['> 0.5%, last 2 versions, ie >= 11']
    })
  ],
});
