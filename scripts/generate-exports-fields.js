'use strict';
const { relative } = require('path');
const { readFile, writeFile } = require('fs').promises;
const entries = require('core-js-compat/entries');

const core = Object.keys(entries).reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  // eslint-disable-next-line unicorn/no-unsafe-regex
  const match = entry.match(/^(\.\/(?:es|stable|features)(?:\/[\w-]+)?)(?:\/[\w-]+)?/);
  if (match) {
    const [, scope] = match;
    if (entry === scope) {
      const path = `./${ relative('./packages/core-js', require.resolve(`../packages/${ it }`)).replace(/\\/g, '/') }`;
      accumulator[entry] = path;
    } else {
      accumulator[`${ scope }/*`] = `${ scope }/*.js`;
    }
  } return accumulator;
}, {
  '.': './index.js',
  './configurator': './configurator.js',
  './internals/*': './internals/*.js',
  './modules/*': './modules/*.js',
  './package': './package.json',
  './postinstall': './postinstall.js',
  './proposals': './proposals/index.js',
  './proposals/*': './proposals/*.js',
  './stage': './stage/index.js',
  './stage/*': './stage/*.js',
  './web': './web/index.js',
  './web/*': './web/*.js',
});

async function writeExportsField(path, exports) {
  const pkg = JSON.parse(await readFile(path, 'utf8'));
  pkg.exports = exports;
  await writeFile(path, `${ JSON.stringify(pkg, null, '  ') }\n`);
}

(async function () {
  await writeExportsField('./packages/core-js/package.json', core);
  await writeExportsField('./packages/core-js-pure/package.json', core);
  // eslint-disable-next-line no-console
  console.log('\u001B[32m`exports` fields updated\u001B[0m');
})();
