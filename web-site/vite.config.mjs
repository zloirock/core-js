/* eslint-disable import/no-unresolved -- dependencies are not installed */
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

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
    cssTarget: [
      'ie11'
    ]
  },
  plugins: [
    babel(),
  ],
});
