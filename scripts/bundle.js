'use strict';
const { writeFile } = require('fs').promises;
const { minify } = require('terser');
const builder = require('@core-js/builder');
const { banner } = require('@core-js/builder/config');
const actual = require('@core-js/compat/entries')['core-js/actual'];

const PATH = './packages/core-js-bundle/';

function log(kind, name, code) {
  // eslint-disable-next-line no-console -- output
  console.log(`\u001B[32m${ kind }: \u001B[36m${ PATH }${ name }.js\u001B[32m, size: \u001B[36m${
    (code.length / 1024).toFixed(2) }KB\u001B[0m`);
}

async function bundle({ name, ...options }) {
  const source = await builder({ filename: `${ PATH }${ name }.js`, ...options });
  log('bundling', name, source);

  const minified = `${ name }.min`;

  const { code, map } = await minify(source, {
    ecma: 5,
    keep_fnames: true,
    compress: {
      hoist_funs: false,
      hoist_vars: true,
      pure_getters: true,
      passes: 3,
      unsafe_proto: true,
      unsafe_undefined: true,
    },
    format: {
      max_line_len: 32000,
      preamble: banner,
      webkit: false,
    },
    sourceMap: {
      url: `${ minified }.map`,
    },
  });

  await writeFile(`${ PATH }${ minified }.js`, code);
  await writeFile(`${ PATH }${ minified }.map`, map);
  log('minification', minified, code);
}

bundle({ name: 'full' });
bundle({ name: 'actual', modules: actual });
