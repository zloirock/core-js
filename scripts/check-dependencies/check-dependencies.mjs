const ignore = {
  'core-js-builder': [
    'mkdirp',
    'webpack',
  ],
  'tests/observables': [
    'moon-unit',
  ],
  website: [
    'jsdom',  // pinned because of a bug https://github.com/jsdom/jsdom/issues/3959
  ],
};

const pkgs = await glob([
  'package.json',
  'website/package.json',
  '@(packages|scripts|tests)/*/package.json',
]);

await Promise.all(pkgs.map(async path => {
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  if (!dependencies && !devDependencies) return;

  const exclude = ignore[name];

  const { stdout } = await $({ verbose: false })`updates \
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
