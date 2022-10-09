import { promisify } from 'util';
import david from 'david';
import semver from 'semver';

const { eq, coerce, minVersion, validRange } = semver;
const getDependencies = promisify(david.getDependencies);

const ignoreEverywhere = new Set([
  'moon-unit',
]);

const ignoreInPackages = new Set([
  ...ignoreEverywhere,
  'mkdirp',
  'webpack',
]);

await Promise.all((await glob(['package.json', 'packages/*/package.json'])).map(async path => {
  const pkg = await fs.readJson(path);
  const dependencies = await getDependencies({
    dependencies: {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    },
  });
  const ignore = path === 'package.json' ? ignoreEverywhere : ignoreInPackages;
  for (const name of Object.keys(dependencies)) {
    if (ignore.has(name)) {
      delete dependencies[name];
      continue;
    }
    const { required, stable, warn } = dependencies[name];
    if (!validRange(required) || warn || eq(minVersion(required), coerce(stable))) {
      delete dependencies[name];
    }
  }
  if (Object.keys(dependencies).length) {
    echo(chalk.cyan(`${ pkg.name ?? 'root' }:`));
    console.table(dependencies);
  }
}));

echo(chalk.green('dependencies checked'));
