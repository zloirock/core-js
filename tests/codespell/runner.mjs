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
  'forHead',
  'forIn',
  'iif', // the rxjs conditional-observable operator, not a misspelt "if"
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
