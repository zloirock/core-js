'use strict';
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const modules = require('../modules');
const modulesByVersions = require('./modules-by-versions');

const defaults = new Set(modules);

for (const version of Object.values(modulesByVersions)) {
  for (const module of version) defaults.delete(module);
}

writeFileSync(resolve(__dirname, '../modules-by-versions.json'), JSON.stringify({
  '4.0': [...defaults],
  ...modulesByVersions,
}, null, '  '));

// eslint-disable-next-line no-console -- output
console.log('\u001B[32mmodules-by-versions data rebuilt\u001B[0m');
