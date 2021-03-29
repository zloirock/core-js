'use strict';
const { readFileSync, writeFileSync } = require('fs');
const { dirname, resolve } = require('path');
const detective = require('detective');
const { sync: glob } = require('glob');
const { intersection, sortObjectByKey } = require('../helpers');
const modules = require('../modules');

function getModulesForEntryPoint(entry) {
  const match = entry.match(/[/\\]modules[/\\]([^/\\]+)$/);
  if (match) return [match[1]];
  const name = require.resolve(entry);
  const result = [];
  const dir = dirname(name);
  const file = readFileSync(name);
  const dependencies = detective(file);
  for (const dependency of dependencies) {
    const relative = resolve(dir, dependency);
    result.push(...getModulesForEntryPoint(relative));
  }
  return intersection(result, modules);
}

const entries = [
  'packages/core-js/index.js',
  ...glob('packages/core-js/actual/**/*.js'),
  ...glob('packages/core-js/es/**/*.js'),
  ...glob('packages/core-js/full/**/*.js'),
  ...glob('packages/core-js/modules/*.js'),
  ...glob('packages/core-js/proposals/**/*.js'),
  ...glob('packages/core-js/stable/**/*.js'),
  ...glob('packages/core-js/stage/**/*.js'),
  ...glob('packages/core-js/web/**/*.js'),
].reduce((memo, file) => {
  // TODO: store entries without the package name in `core-js@4`
  const entry = file.replace(/^packages\/(core-js.+)\.js$/, '$1').replace(/^(.+)\/index$/, '$1');
  memo[entry] = getModulesForEntryPoint(resolve(__dirname, `../../${ entry }`));
  return memo;
}, {});

writeFileSync(resolve(__dirname, '../entries.json'), JSON.stringify(sortObjectByKey(entries), null, '  '));

// eslint-disable-next-line no-console -- output
console.log('\u001B[32mentries data rebuilt\u001B[0m');
