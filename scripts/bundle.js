'use strict';
const builder = require('@core-js/builder');
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
}

bundle({ name: 'full', minify: false });
bundle({ name: 'full.min' });
bundle({ name: 'actual', modules: actual, minify: false });
bundle({ name: 'actual.min', modules: actual });
