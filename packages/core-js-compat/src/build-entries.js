'use strict';
const { readFileSync, writeFileSync } = require('fs');
const { dirname, resolve } = require('path');
const detective = require('detective');
const { sync: glob } = require('glob');
const data = require('./data');
const order = Object.keys(data);

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
  const resultSet = new Set(result);
  return order.filter(it => resultSet.has(it));
}

const entries = {};

[
  'packages/core-js/index.js',
  ...glob('packages/core-js/es/**/*.js'),
  ...glob('packages/core-js/features/**/*.js'),
  ...glob('packages/core-js/proposals/**/*.js'),
  ...glob('packages/core-js/stable/**/*.js'),
  ...glob('packages/core-js/stage/**/*.js'),
  ...glob('packages/core-js/web/**/*.js'),
  ...glob('packages/core-js/modules/*.js'),
].forEach(file => {
  const entry = file.replace(/^packages\/(core-js.+)\.js$/, '$1').replace(/^(.+)\/index$/, '$1');
  entries[entry] = getModulesForEntryPoint(resolve(__dirname, `../../${ entry }`));
});

writeFileSync(resolve(__dirname, '../entries.json'), JSON.stringify(entries, null, '  '));
