import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: 'src',
  publicDir: 'public',
  base: '',
  build: {
    rollupOptions: {
      input: {
        main: 'src/index.html',
        playground: 'src/playground.html',
      },
    },
    outDir: '../templates',
    emptyOutDir: true,
    minify: true,
    cssTarget: [
      'ie11',
    ],
  },
  plugins: [
    legacy({
      polyfills: false,
    }),
  ],
});
