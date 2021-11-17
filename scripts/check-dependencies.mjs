import { promisify } from 'util';
import david from 'david';
import semver from 'semver';

const { eq, coerce, minVersion } = semver;
const getDependencies = promisify(david.getDependencies);

const ignoreEverywhere = new Set([
  'cli-table',
  'moon-unit',
]);

const ignoreInPackages = new Set([
  'mkdirp',
  'semver',
  'webpack',
]);

await Promise.all((await globby(['package.json', 'packages/*/package.json'])).map(async path => {
  const pkg = JSON.parse(await fs.readFile(path));
  const dependencies = await getDependencies(pkg);
  const devDependencies = await getDependencies(pkg, { dev: true });
  Object.assign(dependencies, devDependencies);
  for (const name of Object.keys(dependencies)) {
    if (ignoreEverywhere.has(name) || (path !== 'package.json' && ignoreInPackages.has(name))) {
      delete dependencies[name];
      continue;
    }
    const { required, stable, warn } = dependencies[name];
    if (/^(?:file|git)/.test(required) || warn || eq(minVersion(required), coerce(stable))) {
      delete dependencies[name];
    }
  }
  if (Object.keys(dependencies).length) {
    console.log(chalk.cyan(`${ pkg.name ?? 'root' }:`));
    console.table(dependencies);
  }
}));

console.log(chalk.green('dependencies checked'));
