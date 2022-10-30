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
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  if (!dependencies && !devDependencies) return;

  const exclude = ignore[name];

  $.verbose = false;

  const { stdout } = await $`npx updates \
    --json \
    --file ${ path } \
    --exclude ${ Array.isArray(exclude) ? exclude.join(',') : '' } \
  `;

  const { results } = JSON.parse(stdout);
  const obsolete = { ...results.dependencies, ...results.devDependencies };

  if (Object.keys(obsolete).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(obsolete);
  }
}));

echo(chalk.green('dependencies checked'));
