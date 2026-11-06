const skipNames = [['', '.map'], ['package', '.json']];
const skip = [
  ...skipNames.map(parts => parts.join('*')),
  '**/node_modules/**',
  './tests/bundles/**',
  './tests/**/bundles/**',
  './packages/core-js-bundle/*.js',
  './website/dist/**',
  './website/templates/**',
  './website/src/public/**',
];

const ignoreWords = [
  'aNumber',
  'larg',
  'outLow',
  'statics',
];

// Match the walk's basename exclusions for explicit paths. Pass parent components through literally.
const targets = argv._.flatMap(target => {
  const file = String(target);
  const { root } = path.parse(file);
  const parts = (root.endsWith(':') ? file.slice(root.length) : file).replaceAll(path.sep, '/').split('/');
  if (!file || file === '-' || parts.includes('..')) return [target];
  const relative = path.relative('.', file);
  if (!relative) return ['.'];
  const names = path.sep === '\\' ? relative.toLowerCase() : relative;
  if (names.split(path.sep).some(name => skipNames.some(([start, end]) => name.startsWith(start) && name.endsWith(end)))) return [];
  if (path.isAbsolute(relative)) return [target];
  return [`./${ relative }${ ['', '.'].includes(parts.at(-1)) ? '/' : '' }`];
});

if (argv._.length) echo(chalk.red(`SCOPED RUN: ${ argv._.length } path(s) - not a full verification`));
// the binary is a `pip` package, not a dependency of this repository. on CI the workflow installs
// it, so there its absence has to go red instead of quietly dropping the only spelling gate
if (!await which('codespell', { nothrow: true })) {
  echo((process.env.CI ? chalk.red : chalk.cyan)('codespell is not found'));
  if (process.env.CI) process.exitCode = 1;
} else if (!argv._.length || targets.length) {
  const result = await $({ stdio: 'inherit', nothrow: true })`codespell \
    --skip=${ String(skip) } \
    --ignore-words-list=${ String(ignoreWords) } \
    --enable-colors \
    -- ${ targets }`;
  if (result.exitCode !== 0) process.exitCode = 1;
}
