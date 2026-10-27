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
      },
    },
    outDir: '../templates',
    emptyOutDir: true,
    // oxc minifies the legacy chunks with an es2015 target (template literals, arrows) - terser keeps them ES5
    minify: 'terser',
    // the browsers of the legacy targets below: the CSS gets their prefixes (`-webkit-` flexbox, sticky) only from here
    cssTarget: [
      'ie11',
      'chrome38',
      'safari7.1',
      'firefox15',
    ],
  },
  plugins: [
    legacy({
      targets: 'IE 11, Chrome>=38, Safari>=7.1, FF>=15',
      polyfills: false,
    }),
  ],
});
