const ignore = {
  'core-js-builder': [
    'mkdirp',
    'webpack',
  ],
  'tests/observables': [
    'moon-unit',
  ],
};

await Promise.all((await glob(['package.json', '@(packages|scripts|tests)/*/package.json'])).map(async path => {
  const pkg = await fs.readJson(path);
  if (!pkg.dependencies && !pkg.devDependencies) return;

  const name = pkg.name ?? 'root';
  const exclude = ignore[name];

  $.verbose = false;

  const { stdout } = await $`npx updates \
    --json \
    --file ${ path } \
    --exclude ${ Array.isArray(exclude) ? exclude.join(',') : '' } \
  `;

  const { results } = JSON.parse(stdout);
  const dependencies = { ...results.dependencies, ...results.devDependencies };

  if (Object.keys(dependencies).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(dependencies);
  }
}));

echo(chalk.green('dependencies checked'));
