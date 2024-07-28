const ignore = {
  'core-js-builder': [
    'mkdirp',
    'webpack',
  ],
  'scripts/check-dependencies': [
    'updates',
  ],
  'tests/observables': [
    'moon-unit',
  ],
};

const pkgs = await glob('?(@(packages|scripts|tests)/*/)package.json');

await Promise.all(pkgs.map(async path => {
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  if (!dependencies && !devDependencies) return;

  const exclude = ignore[name];

  $.verbose = false;

  const { stdout } = await $`updates \
    --json \
    --file ${ path } \
    --exclude ${ Array.isArray(exclude) ? exclude.join(',') : '' } \
  `;

  const results = JSON.parse(stdout)?.results?.npm;
  const obsolete = { ...results?.dependencies, ...results?.devDependencies };

  if (Object.keys(obsolete).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(obsolete);
  }
}));

echo(chalk.green('dependencies checked'));
