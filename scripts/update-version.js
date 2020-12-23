'use strict';
/* eslint-disable no-console */
const { readdir, readFile, writeFile } = require('fs').promises;
const NEW_VERSION = require('../package').version;
const PREV_VERSION = require('../packages/core-js/package').version;

const NEW_VERSION_MINOR = NEW_VERSION.replace(/^(\d+\.\d+)\..*/, '$1');
const PREV_VERSION_MINOR = PREV_VERSION.replace(/^(\d+\.\d+)\..*/, '$1');
const LICENSE = './LICENSE';
const README = './README.md';
const SHARED = './packages/core-js/internals/shared.js';
const CURRENT_YEAR = `${ new Date().getFullYear() }`;

(async function () {
  const license = await readFile(LICENSE, 'utf8');
  const OLD_YEAR = +license.match(/2014-(\d{4}) D/m)[1];
  if (NEW_VERSION === PREV_VERSION && CURRENT_YEAR === OLD_YEAR) {
    return console.log('\u001B[31mupdate is not required\u001B[0m');
  }
  await writeFile(LICENSE, license.split(OLD_YEAR).join(CURRENT_YEAR));
  const readme = await readFile(README, 'utf8');
  await writeFile(README, readme
    .split(PREV_VERSION).join(NEW_VERSION)
    .split(PREV_VERSION_MINOR).join(NEW_VERSION_MINOR));
  const shared = await readFile(SHARED, 'utf8');
  await writeFile(SHARED, shared
    .split(PREV_VERSION).join(NEW_VERSION)
    .split(OLD_YEAR).join(CURRENT_YEAR));
  const packages = await readdir('./packages');
  for (const NAME of packages) {
    const PATH = `./packages/${ NAME }/package.json`;
    const pkg = JSON.parse(await readFile(PATH, 'utf8'));
    pkg.version = NEW_VERSION;
    for (const field of ['dependencies', 'devDependencies']) {
      if (pkg[field]) for (const dependency of packages) {
        if (pkg[field][dependency]) pkg[field][dependency] = NEW_VERSION;
      }
    }
    await writeFile(PATH, `${ JSON.stringify(pkg, null, '  ') }\n`);
  }
  if (CURRENT_YEAR !== OLD_YEAR) console.log('\u001B[32mthe year updated\u001B[0m');
  if (NEW_VERSION !== PREV_VERSION) console.log('\u001B[32mthe version updated\u001B[0m');
})();
