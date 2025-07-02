import { defineConfig } from 'vite';
import { resolve } from 'path';

// const distDir = resolve(__dirname, './dist');
//
// const noAttr = () => {
//   return {
//     name: "no-crossorigin",
//     transformIndexHtml(html) {
//       return html.replace(` type="module" crossorigin`, '').replace(` crossorigin`, '');
//     }
//   }
// }

const distDir = '';

export default defineConfig({
  root: 'src',
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
  // plugins: [noAttr()]
});
