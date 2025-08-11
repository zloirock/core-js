import builder from '@core-js/builder';
import { minify } from 'terser';

const { script } = await builder({
  modules: 'full',
  targets: { esmodules: true },
});
const { code } = await minify(script);
await fs.writeFile('website/src/public/core-js-bundle-modern.js', code, 'utf8');
