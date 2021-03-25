'use strict';
const { relative } = require('path');
const { readFile, writeFile } = require('fs').promises;
const base = require('core-js-compat/entries');
const builder = require('../packages/core-js-builder/exports');
const bundle = require('../packages/core-js-bundle/exports');
const compat = require('../packages/core-js-compat/exports');

const entries = Object.keys(base);
entries.push('core-js/configurator');

const core = entries.reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  const path = `./${ relative('./packages/core-js', require.resolve(`../packages/${ it }`)).replace(/\\/g, '/') }`;
  accumulator[entry] = path;
  if (path.endsWith('/index.js')) accumulator[path.replace(/\.js$/, '')] = path;
  accumulator[path] = path;
  return accumulator;
}, {});

function expland(array) {
  const map = {};
  for (const it of array) {
    const path = `./${ it }`;
    if (path.endsWith('/index.js')) map[path.replace(/\/index\.js(on)?$/, '').replace(/^\.$/, './')] = path;
    map[path.replace(/\.js(on)?$/, '')] = path;
    map[path] = path;
  } return map;
}

async function writeExportsField(path, exports) {
  const pkg = JSON.parse(await readFile(path));
  exports['./package'] = './package.json';
  exports['./package.json'] = './package.json';
  pkg.exports = exports;
  await writeFile(path, `${ JSON.stringify(pkg, null, '  ') }\n`);
}

(async function () {
  await writeExportsField('./packages/core-js/package.json', core);
  await writeExportsField('./packages/core-js-pure/package.json', core);
  await writeExportsField('./packages/core-js-builder/package.json', expland(builder));
  await writeExportsField('./packages/core-js-bundle/package.json', expland(bundle));
  await writeExportsField('./packages/core-js-compat/package.json', expland(compat));
  // eslint-disable-next-line no-console
  console.log('\u001B[32m`exports` fields updated\u001B[0m');
})();
