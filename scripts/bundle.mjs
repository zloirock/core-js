import builder from '@core-js/builder';
import entries from '@core-js/compat/entries';

const DENO = process.argv.includes('--deno');
const PATH = './packages/core-js/bundle/';
const summary = { console: { size: true } };

if (DENO) {
  builder({ filename: './deno/corejs/full.js', targets: { deno: '1.0' }, minify: false, summary });
} else {
  builder({ filename: './tests/bundles/core-js.js', minify: false, summary });
  builder({ filename: `${ PATH }full.js`, summary });
  builder({ filename: `${ PATH }actual.js`, modules: entries['core-js/actual'], summary });
}
