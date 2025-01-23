const skip = [
  '*.map',
  'package**.json',
  '**/node_modules/**',
  './tests/**bundles',
  './packages/core-js-bundle/*.js',
];

const ignoreWords = [
  'larg',
  'outLow',
  'statics',
];

await $`codespell \
  --skip=${ String(skip) } \
  --ignore-words-list=${ String(ignoreWords) } \
  --enable-colors`;
