const { copy, lstat, pathExists } = fs;
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

await copy('packages/core-js', 'packages/core-js-pure', options(false));

const license = (await glob('packages/*/package.json')).map(path => path.replace(/package\.json$/, 'LICENSE'));

await Promise.all([
  copy('packages/core-js-pure/override', 'packages/core-js-pure', options(true)),
  ...license.map(path => copy('LICENSE', path, options(true))),
]);

echo(chalk.green(`copied ${ chalk.cyan(copied) } files`));
