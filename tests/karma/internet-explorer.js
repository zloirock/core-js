'use strict';
const { existsSync } = require('node:fs');
const { join } = require('node:path');

const PROGRAM_FILES = [
  'PROGRAMW6432',
  'PROGRAMFILES(X86)',
  'PROGRAMFILES',
];

// where `karma-ie-launcher` itself resolves the browser: `IE_BIN`, then the standard location
// under each flavor of the program files directory - PATH never mentions Internet Explorer
module.exports = function findInternetExplorer() {
  return process.env.IE_BIN || PROGRAM_FILES
    .map(variable => process.env[variable])
    .filter(Boolean)
    .map(prefix => join(prefix, 'Internet Explorer', 'iexplore.exe'))
    // eslint-disable-next-line node/no-sync -- karma resolves its configuration synchronously
    .find(binary => existsSync(binary));
};
