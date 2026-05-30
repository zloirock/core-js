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
  'aNumber',
  'disjointness',
  'forIn',
  'importEnd',
  'larg',
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
