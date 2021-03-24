const { copy, lstat, pathExists, readdir, rm } = fs;
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

await rm('./packages/core-js/bundle', { force: true, recursive: true });

await Promise.all((await readdir('./packages/core-js-pure'))
  .filter(entry => !['override', '.npmignore', 'package.json', 'README.md'].includes(entry))
  .map(entry => rm(`./packages/core-js-pure/${ entry }`, { force: true, recursive: true })));

await rm('./tests/bundles', { force: true, recursive: true });

// eslint-disable-next-line no-console -- output
console.log(chalk.green('old copies removed'));

await copy('./LICENSE', './deno/corejs/LICENSE', options(true));

for (const pkg of await readdir('./packages')) {
  if (await pathExists(`./packages/${ pkg }/package.json`)) {
    await copy('./LICENSE', `./packages/${ pkg }/LICENSE`, options(true));
  }
}

await copy('./packages/core-js', './packages/core-js-pure', options(false));
await copy('./packages/core-js-pure/override', './packages/core-js-pure', options(true));
await copy('./packages/core-js/postinstall.js', './packages/core-js-bundle/postinstall.js', options(true));

// eslint-disable-next-line no-console -- output
console.log(chalk.green(`copied ${ chalk.cyan(copied) } files`));
