import config from './config.mjs';

const pkgs = await glob([
  'package.json',
  'website/package.json',
  '@(packages|scripts|tests)/*/package.json',
]);

async function checkPackage(path) {
  const { name = 'root', dependencies, devDependencies } = await fs.readJson(path);
  const exceptions = config[name];

  if (exceptions === 'exclude' || (!dependencies && !devDependencies)) return;

  const allDependencies = [...Object.entries(dependencies ?? {}), ...Object.entries(devDependencies ?? {})];
  const allDependenciesNames = allDependencies.map(([key]) => key);

  function getExceptionsKind(kind) {
    if (exceptions === kind) return allDependenciesNames;
    return Object.entries(exceptions ?? []).flatMap(([key, value]) => {
      if (value !== kind) return [];
      if (!key.includes('*')) return [key];
      const re = new RegExp(`^${ key.replaceAll('*', '.+') }$`);
      return allDependenciesNames.filter(it => re.test(it));
    });
  }

  const exclude = getExceptionsKind('exclude');
  for (const [key, version] of allDependencies) {
    if (key.startsWith('@core-js/') || version.startsWith('file:')) exclude.push(key);
  }

  const minor = getExceptionsKind('minor');
  const patch = getExceptionsKind('patch');

  const { stdout } = await $({ verbose: false })`updates \
    --json \
    --file ${ path } \
    --timeout 60000 \
    --exclude ${ exclude.join(',') } \
    --minor ${ minor.join(',') } \
    --patch ${ patch.join(',') } \
    ${ process.env.UDEPS ? '--update' : [] } \
  `;

  const results = JSON.parse(stdout)?.results?.npm;
  const obsolete = { ...results?.dependencies, ...results?.devDependencies };

  if (Object.keys(obsolete).length) {
    echo(chalk.cyan(`${ name }:`));
    console.table(obsolete);
  }
}

let i = 0;

await Promise.all(Array(os.cpus().length).fill().map(async () => {
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
