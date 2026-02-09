import coerce from 'semver/functions/coerce.js';
import { modules } from '../../packages/core-js-compat/src/data.mjs';

const { version } = await fs.readJson('package.json');
const $version = coerce(version);

// TODO: set to `true` after the first core-js@4 stable release
const HAS_STABLE_RELEASE = false;

const $modules = new Set(modules);
let data;

if (HAS_STABLE_RELEASE) {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@core-js/compat@${ $version.major }/modules-by-versions.json`);
  data = await response.json();
} else {
  data = {};
}

for (const prev of Object.values(data)) {
  for (const module of prev) $modules.delete(module);
}

if ($modules.size) data[`${ $version }-unreleased`] = [...$modules];

await fs.writeJson('packages/core-js-compat/modules-by-versions.json', data, { spaces: '  ' });

echo(chalk.green('modules-by-versions data rebuilt'));
