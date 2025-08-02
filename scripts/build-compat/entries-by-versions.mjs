import coerce from 'semver/functions/coerce.js';

const entries = await fs.readJson('packages/core-js-compat/entries.json');

const { version } = await fs.readJson('package.json');
const $version = coerce(version);

// TODO: set to `true` after the first core-js@4 stable release
const HAS_STABLE_RELEASE = false;

const $entries = new Set(Object.keys(entries));
let data;

if (HAS_STABLE_RELEASE) {
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@core-js/compat@${ $version.major }/entries-by-versions.json`);
  data = await response.json();
} else {
  data = {};
}

for (const prev of Object.values(data)) {
  for (const entry of prev) $entries.delete(entry);
}

if ($entries.size) data[`${ $version }-unreleased`] = [...$entries];

await fs.writeJson('packages/core-js-compat/entries-by-versions.json', data, { spaces: '  ' });

echo(chalk.green('entries-by-versions data rebuilt'));
