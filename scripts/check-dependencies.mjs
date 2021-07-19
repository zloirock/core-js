/* eslint-disable no-console -- output */
import { promisify } from 'util';
import david from 'david';
import semver from 'semver';

const { eq, coerce, minVersion } = semver;
const getDependencies = promisify(david.getDependencies);

async function checkDependencies(path, title) {
  if (!await fs.pathExists(`./${ path }/package.json`)) return;
  const pkg = JSON.parse(await fs.readFile(`./${ path }/package.json`));
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
    console.log(chalk.cyan(`${ title || pkg.name }:`));
    console.table(dependencies);
  }
}

await checkDependencies('', 'root');
await Promise.all((await fs.readdir('./packages')).map(path => checkDependencies(`packages/${ path }`)));
console.log(chalk.green('dependencies checked'));
