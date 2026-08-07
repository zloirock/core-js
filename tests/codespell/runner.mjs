const skip = [
  '*.map',
  'package**.json',
  '**/node_modules/**',
  './tests/**bundles',
  // e2e-libs build output. Gitignored, so CI never sees it — it does not exist on a fresh checkout —
  // but it does for anyone who ran `e2e-libs` before `lint`, and it is full of third-party
  // identifiers this dictionary reads as typos.
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
  // htmlparser2's streaming-handler callback name, spelled by the library — the e2e-libs fixture
  // passes `{ onopentag, ontext, onclosetag }` to `new Parser(...)` and cannot rename any of them
  'ontext',
  'outLow',
  'prevEnd',
  'statics',
  'throughTS',
];

await $`codespell \
  --skip=${ String(skip) } \
  --ignore-words-list=${ String(ignoreWords) } \
  --enable-colors`;
