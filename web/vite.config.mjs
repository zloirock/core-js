/* eslint-disable import/no-unresolved -- dependencies are not installed */
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

const distDir = '';

export default defineConfig({
  root: 'src',
  publicDir: 'public',
  base: distDir,
  build: {
    rollupOptions: {
      input: {
        main: 'src/index.html',
        playground: 'src/playground.html',
      },
    },
    outDir: '../templates',
    emptyOutDir: true,
  },
  plugins: [
    legacy({
      targets: [
        'IE 11',
        'Chrome 38',
        'Safari 7.1',
        'Firefox 15',
      ],
    }),
  ],
});
