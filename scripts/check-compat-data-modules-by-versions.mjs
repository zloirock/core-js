import semver from 'semver';
const { version } = require('../package');
const modulesByVersions = require('../packages/core-js-compat/modules-by-versions');

const { major, minor, patch } = semver.coerce(version);
let ok = true;

if (minor || patch) { // ignore for pre-releases
  const zero = `${ major }.0`;
  const result = await fetch(`https://unpkg.com/core-js-compat@${ major }/modules-by-versions.json`);
  const prev = await result.json();
  const set = new Set(prev[zero]);
  for (const mod of modulesByVersions[zero]) {
    if (!set.has(mod)) {
      ok = false;
      console.log(chalk.red(`${ chalk.cyan(mod) } should be added to modules-by-versions`));
    }
  }
}

if (!ok) throw console.log(chalk.red('\nmodules-by-versions should be updated'));
console.log(chalk.green('modules-by-versions checked'));
