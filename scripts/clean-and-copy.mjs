const { copy, ensureFile, lstat, pathExists, rm, writeFile } = fs;
let copied = 0;

function options(overwrite) {
  return {
    async filter(from, to) {
      if ((await lstat(from)).isDirectory()) return true;
      if (!overwrite && await pathExists(to)) return false;
      return !!++copied;
    },
  };
}

await Promise.all((await glob([
  'tests/**/bundles/*',
  // TODO: drop it from `core-js@4`
  'packages/core-js/features',
  'packages/core-js-pure/!(override|.npmignore|package.json|README.md)',
], { onlyFiles: false })).map(path => rm(path, { force: true, recursive: true })));

echo(chalk.green('old copies removed'));

// TODO: drop it from `core-js@4`
const files = await glob('packages/core-js/full/**/*.js');

for (const filename of files) {
  const newFilename = filename.replace('full', 'features');
  const href = '../'.repeat(filename.split('').filter(it => it === '/').length - 2) + filename.slice(17, -3).replace(/\/index$/, '');
  await ensureFile(newFilename);
  await writeFile(newFilename, `'use strict';\nmodule.exports = require('${ href }');\n`);
}

echo(chalk.green('created /features/ entries'));

await copy('packages/core-js', 'packages/core-js-pure', options(false));

const license = [
  'deno/corejs/LICENSE',
  ...(await glob('packages/*/package.json')).map(path => path.replace(/package\.json$/, 'LICENSE')),
];

await Promise.all([
  copy('packages/core-js-pure/override', 'packages/core-js-pure', options(true)),
  copy('packages/core-js/postinstall.js', 'packages/core-js-bundle/postinstall.js', options(true)),
  ...license.map(path => copy('LICENSE', path, options(true))),
]);

echo(chalk.green(`copied ${ chalk.cyan(copied) } files`));
