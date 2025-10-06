/* eslint-disable import/no-unresolved -- dependencies are not installed */
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
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
    viteStaticCopy({
      targets: [
        {
          src: 'images/license.txt',
          dest: 'assets',
        },
      ],
    }),
  ],
});
