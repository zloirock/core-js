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

// edit-loop scoping: positional paths narrow the run to them, gates run the unscoped default
const targets = argv._;

// the binary is a `pip` package, not a dependency of this repository. on CI the workflow installs
// it, so there its absence has to go red instead of quietly dropping the only spelling gate
if (process.env.CI || await which('codespell', { nothrow: true })) {
  if (targets.length) echo(chalk.red(`SCOPED RUN: ${ targets.length } path(s) - not a full verification`));

  await $`codespell \
    --skip=${ String(skip) } \
    --ignore-words-list=${ String(ignoreWords) } \
    --enable-colors \
    ${ targets }`;
} else echo(chalk.cyan('codespell is not found'));
