const skip = [
  '*.map',
  'package**.json',
  '**/node_modules/**',
  './tests/**bundles',
  './packages/core-js-bundle/*.js',
  './website/dist/**',
  './website/templates/**',
  './website/src/public/**',
];

const ignoreWords = [
  'ND',
  'aNumber',
  'customE',
  'disjointness',
  'forIn',
  'importEnd',
  'larg',
  'outLow',
  'prevEnd',
  'statics',
  'throughTS',
];

await $`codespell \
  --skip=${ String(skip) } \
  --ignore-words-list=${ String(ignoreWords) } \
  --enable-colors`;
