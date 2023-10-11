import coerce from 'semver/functions/coerce.js';

const { version } = await fs.readJson('package.json');
const { major, minor, patch } = coerce(version);
let ok = true;

// TODO: enable it after `core-js@4` publishing
if (minor < 0 || patch < 0) { // ignore for pre-releases
  const zero = `${ major }.0`;
  const modulesByVersions = await fs.readJson('packages/core-js-compat/modules-by-versions.json');
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@core-js/compat@${ major }.0.0/modules-by-versions.json`);
  const zeroVersionData = await response.json();
  const set = new Set(zeroVersionData[zero]);
  for (const mod of modulesByVersions[zero]) {
    if (!set.has(mod)) {
      ok = false;
      echo(chalk.red(`${ chalk.cyan(mod) } should be added to modules-by-versions`));
    }
  }
}

if (!ok) throw echo(chalk.red('\nmodules-by-versions should be updated'));
echo(chalk.green('modules-by-versions checked'));
