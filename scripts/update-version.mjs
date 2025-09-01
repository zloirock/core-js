const { readJson, readFile, writeJson, writeFile } = fs;
const { green, red } = chalk;
const [PREV_VERSION, NEW_VERSION] = (await Promise.all([
  readJson('packages/core-js/package.json'),
  readJson('package.json'),
])).map(it => it.version);

function getMinorVersion(version) {
  return version.match(/^(?<minor>\d+\.\d+)\..*/).groups.minor;
}

const PREV_VERSION_MINOR = getMinorVersion(PREV_VERSION);
const NEW_VERSION_MINOR = getMinorVersion(NEW_VERSION);
const CHANGELOG = 'CHANGELOG.md';
const LICENSE = 'LICENSE';
const README = 'README.md';
const README_COMPAT = 'packages/core-js-compat/README.md';
const README_DENO = 'deno/corejs/README.md';
const SHARED = 'packages/core-js/internals/shared-store.js';
const BUILDER_CONFIG = 'packages/core-js-builder/config.js';
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();

const license = await readFile(LICENSE, 'utf8');
const OLD_YEAR = +license.match(/2014-(?<year>\d{4}) D/).groups.year;
await writeFile(LICENSE, license.replaceAll(OLD_YEAR, CURRENT_YEAR));

const readme = await readFile(README, 'utf8');
await writeFile(README, readme.replaceAll(PREV_VERSION, NEW_VERSION).replaceAll(PREV_VERSION_MINOR, NEW_VERSION_MINOR));

const readmeCompat = await readFile(README_COMPAT, 'utf8');
await writeFile(README_COMPAT, readmeCompat.replaceAll(PREV_VERSION_MINOR, NEW_VERSION_MINOR));

const readmeDeno = await readFile(README_DENO, 'utf8');
await writeFile(README_DENO, readmeDeno.replaceAll(PREV_VERSION, NEW_VERSION));

const shared = await readFile(SHARED, 'utf8');
await writeFile(SHARED, shared.replaceAll(PREV_VERSION, NEW_VERSION).replaceAll(OLD_YEAR, CURRENT_YEAR));

const builderConfig = await readFile(BUILDER_CONFIG, 'utf8');
await writeFile(BUILDER_CONFIG, builderConfig.replaceAll(OLD_YEAR, CURRENT_YEAR));

const packages = await Promise.all((await glob('packages/*/package.json')).map(async path => {
  const pkg = await readJson(path, 'utf8');
  return ({ path, pkg });
}));

for (const { path, pkg } of packages) {
  pkg.version = NEW_VERSION;
  for (const field of ['dependencies', 'devDependencies']) {
    if (pkg[field]) for (const { pkg: { name } } of packages) {
      if (pkg[field][name]) pkg[field][name] = NEW_VERSION;
    }
  }
  await writeJson(path, pkg, { spaces: '  ' });
}

if (NEW_VERSION !== PREV_VERSION) {
  const CURRENT_DATE = `${ CURRENT_YEAR }.${ String(NOW.getMonth() + 1).padStart(2, '0') }.${ String(NOW.getDate()).padStart(2, '0') }`;
  const NUMBER_OF_COMMITS = Number(await $`git rev-list "v${ PREV_VERSION }"..HEAD --count`) + 1;
  const changelog = await readFile(CHANGELOG, 'utf8');
  await writeFile(CHANGELOG, changelog.replaceAll('##### Unreleased', `##### Unreleased\n- Nothing\n\n##### [${
    NEW_VERSION
  } - ${
    CURRENT_DATE
  }](https://github.com/zloirock/core-js/releases/tag/v${
    NEW_VERSION
  })\n- Changes [v${
    PREV_VERSION
  }...v${
    NEW_VERSION
  }](https://github.com/zloirock/core-js/compare/v${
    PREV_VERSION
  }...v${
    NEW_VERSION
  }) (${
    NUMBER_OF_COMMITS
  } commits)`));
}

if (CURRENT_YEAR !== OLD_YEAR) echo(green('the year updated'));
if (NEW_VERSION !== PREV_VERSION) echo(green('the version updated'));
else if (CURRENT_YEAR === OLD_YEAR) echo(red('bump is not required'));

await $`npm run bundle-package deno`;
await $`npm run build-compat`;
