'use strict';
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const data = require('./data');
const modulesByVersions = require('./modules-by-versions');

const modules = new Set(Object.keys(data));

for (const version of Object.values(modulesByVersions)) {
  for (const module of version) modules.delete(module);
}

writeFileSync(resolve(__dirname, '../modules-by-versions.json'), JSON.stringify({
  '3.0': [...modules],
  ...modulesByVersions,
}, null, '  '));
