import { cpus } from 'node:os';

const ignore = {
  'core-js-builder': [
    'mkdirp',
    'webpack',
  ],
  'tests/observables': [
    'moon-unit',
  ],
};

const pkgs = await glob([
  'package.json',
  'website/package.json',
  '@(packages|scripts|tests)/*/package.json',
]);

async function checkPackage(path) {
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  if (!dependencies && !devDependencies) return;

  const exclude = ignore[name];

  const { stdout } = await $({ verbose: false })`updates \
    --json \
    --file ${ path } \
    --timeout 30000 \
    --exclude ${ Array.isArray(exclude) ? exclude.join(',') : '' } \
  `;

  const results = JSON.parse(stdout)?.results?.npm;
  const obsolete = { ...results?.dependencies, ...results?.devDependencies };

  if (Object.keys(obsolete).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(obsolete);
  }
}

let i = 0;

await Promise.all(Array(cpus().length).fill().map(async () => {
  while (i < pkgs.length) {
    const path = pkgs[i++];
    try {
      await checkPackage(path);
    } catch {
      echo(chalk.red(`${ chalk.cyan(path) } check error`));
    }
  }
}));

echo(chalk.green('dependencies checked'));
