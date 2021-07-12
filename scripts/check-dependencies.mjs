/* eslint-disable no-console -- output */
import { join } from 'path';
import { promisify } from 'util';
import david from 'david';
import semver from 'semver';

const { cyan, green } = chalk;
const { readdir, readFile } = fs;
const { eq, coerce, minVersion } = semver;
const getDependencies = promisify(david.getDependencies);

async function checkDependencies(path, title) {
  const pkg = JSON.parse(await readFile(join('.', path, 'package.json')));
  const dependencies = await getDependencies(pkg);
  const devDependencies = await getDependencies(pkg, { dev: true });
  Object.assign(dependencies, devDependencies);
  for (const name of Object.keys(dependencies)) {
    const { required, stable, warn } = dependencies[name];
    if (/^(?:git|file)/.test(required) || warn || eq(minVersion(required), coerce(stable))) {
      delete dependencies[name];
    }
  }
  if (Object.keys(dependencies).length) {
    console.log(cyan(`${ title || pkg.name }:`));
    console.table(dependencies);
  }
}

await checkDependencies('', 'root');
await Promise.all((await readdir('./packages')).map(path => checkDependencies(join('packages', path))));
console.log(green('dependencies checked'));
