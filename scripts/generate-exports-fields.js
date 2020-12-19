'use strict';
const { relative } = require('path');
const { readFile, writeFile } = require('fs').promises;
const compat = require('core-js-compat/entries');

const entries = Object.keys(compat);
entries.push('core-js/configurator');

const map = entries.reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  const path = `./${ relative('./packages/core-js', require.resolve(`../packages/${ it }`)).replace(/\\/g, '/') }`;
  accumulator[entry] = path;
  if (path.endsWith('/index.js')) accumulator[path.replace(/\.js$/, '')] = path;
  accumulator[path] = path;
  return accumulator;
}, {});

async function writeExportsField(path) {
  const pkg = JSON.parse(await readFile(path));
  pkg.exports = map;
  await writeFile(path, `${ JSON.stringify(pkg, null, '  ') }\n`);
}

(async function () {
  await writeExportsField('./packages/core-js/package.json');
  await writeExportsField('./packages/core-js-pure/package.json');
  // eslint-disable-next-line no-console
  console.log('\u001B[32m`exports` fields generated\u001B[0m');
})();
