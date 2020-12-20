'use strict';
const { relative } = require('path');
const { readFile, writeFile } = require('fs').promises;
const entries = require('core-js-compat/entries');
const builder = require('../packages/core-js-builder/exports');
const bundle = require('../packages/core-js-bundle/exports');
const compat = require('../packages/core-js-compat/exports');

const core = Object.keys(entries).reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  if (entry.startsWith('./modules/')) return accumulator;
  const path = `./${ relative('./packages/core-js', require.resolve(`../packages/${ it }`)).replace(/\\/g, '/') }`;
  accumulator[entry] = path;
  return accumulator;
}, {
  './modules/*': './modules/*.js',
  './configurator': './configurator.js',
});

function expland(array) {
  return array.reduce((accumulator, it) => {
    const path = `./${ it }`;
    accumulator[path.replace(/(\/index)?\.js(on)?$/, '').replace(/^\.$/, './')] = path;
    return accumulator;
  }, {});
}

async function writeExportsField(path, exports) {
  const pkg = JSON.parse(await readFile(path));
  exports['./package'] = './package.json';
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
