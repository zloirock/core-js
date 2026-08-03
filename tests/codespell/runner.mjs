// Generated output only. CI never sees these — they do not exist on a fresh checkout — but they do
// exist for anyone who ran `e2e-libs` before `lint`, and they are full of third-party identifiers
// this dictionary reads as typos. All three are gitignored (.gitignore:65-67).
const skip = [
  '*.map',
  'package**.json',
  '**/node_modules/**',
  './tests/**bundles',
  './tests/e2e-libs/.tmp/**',
  './tests/e2e-libs/artifacts/**',
  './tests/e2e-libs/report/**',
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
