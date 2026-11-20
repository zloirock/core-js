'use strict';
const { relative } = require('node:path');
const { parseArgs } = require('node:util');
const { Minimatch } = require('minimatch');
const preprocess = require('./preprocessor');

const { values: { 'test262-dir': test262Dir } } = parseArgs({ strict: false, options: { 'test262-dir': { type: 'string' } } });
const separator = process.argv.indexOf('--', 2);
const patterns = separator === -1 ? [] : process.argv.slice(separator + 1);
const unmatched = new Map(patterns.map(pattern => [pattern, new Minimatch(relative(test262Dir, pattern))]));

process.once('beforeExit', () => {
  for (const pattern of unmatched.keys()) {
    process.stderr.write(`No Test262 files match ${ JSON.stringify(pattern) }\n`);
    process.exitCode = 1;
  }
});

module.exports = test => {
  // Account for selected files before applying the core-js exclusions.
  if (unmatched.size) {
    const file = relative(test262Dir, test.file);
    for (const [pattern, matcher] of unmatched) {
      if (matcher.match(file)) unmatched.delete(pattern);
    }
  }
  return preprocess(test);
};
