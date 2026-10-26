'use strict';
// Bun's CommonJS transpiler drops a function-body `'use strict'` (https://github.com/oven-sh/bun/issues/29533),
// and the bundle keeps its directive inside the IIFE: `require` would run all of it sloppy, so it runs as a script
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInThisContext } = require('node:vm');

const filename = join(__dirname, '../../packages/core-js-bundle/index.js');
// eslint-disable-next-line node/no-sync -- the bundle has to be installed before the tests load
runInThisContext(readFileSync(filename, 'utf8'), { filename });
// the qunit cli loads its files sorted by path, so the tests are loaded here, after the bundle
// eslint-disable-next-line import/no-unresolved -- generated later
require('../bundles/unit-global.js');
