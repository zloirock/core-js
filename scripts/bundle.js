'use strict';
const builder = require('@core-js/builder');
const actual = require('@core-js/compat/entries')['core-js/actual'];

const BUNDLE_PATH = './packages/core-js-bundle/';

builder({ filename: `${ BUNDLE_PATH }full.js`, minify: false, summary: { size: true } });
builder({ filename: `${ BUNDLE_PATH }full.min.js`, summary: { size: true } });
builder({ filename: `${ BUNDLE_PATH }actual.js`, modules: actual, minify: false, summary: { size: true } });
builder({ filename: `${ BUNDLE_PATH }actual.min.js`, modules: actual, summary: { size: true } });
