import { promisify } from 'util';
import david from 'david';
import semver from 'semver';

const { eq, coerce, minVersion } = semver;
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
  const pkg = JSON.parse(await fs.readFile(path));
  const dependencies = await getDependencies(pkg);
  const devDependencies = await getDependencies(pkg, { dev: true });
  const ignore = path === 'package.json' ? ignoreEverywhere : ignoreInPackages;
  Object.assign(dependencies, devDependencies);
  for (const name of Object.keys(dependencies)) {
    if (ignore.has(name)) {
      delete dependencies[name];
      continue;
    }
    const { required, stable, warn } = dependencies[name];
    if (/^(?:file|git)/.test(required) || warn || eq(minVersion(required), coerce(stable))) {
      delete dependencies[name];
    }
  }
  if (Object.keys(dependencies).length) {
    echo(chalk.cyan(`${ pkg.name ?? 'root' }:`));
    console.table(dependencies);
  }
}));

echo(chalk.green('dependencies checked'));
