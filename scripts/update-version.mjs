const { readJson, readFile, writeJson, writeFile } = fs;
const { green, red } = chalk;
const [PREV_VERSION, NEW_VERSION] = (await Promise.all([
  readJson('packages/core-js/package.json'),
  readJson('package.json'),
])).map(it => it.version);
const [PREV_VERSION_MINOR, NEW_VERSION_MINOR] = [PREV_VERSION, NEW_VERSION].map(version => version.match(/^\d+\.\d+(?=\.)/)[0]);

const CHANGELOG = 'CHANGELOG.md';
const LICENSE = 'LICENSE';
const SHARED = 'packages/core-js/internals/shared-store.js';
const BUILDER_CONFIG = 'packages/core-js-builder/config.js';
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();

function updateVersionDocs(text) {
  if (PREV_VERSION === NEW_VERSION) return text;

  const replaceMinor = version => version === PREV_VERSION_MINOR ? NEW_VERSION_MINOR : version;
  const installVersion = /(?<=\bnpm (?:i|install)(?: --save)? ["']?(?:core-js(?:-bundle|-pure)?|@core-js\/[\w-]+)@)(?<minor>\d+\.\d+)\.\d+(?<suffix>[\w+\-.]*)/g;
  const updateVersionOption = options => options.replace(/(?<=(?:["']version["']|\bversion)\s*:\s*["'])\d+\.\d+(?=["'])/, replaceMinor);

  return text
    .replaceAll(installVersion, (version, minor, suffix) => {
      if (minor === PREV_VERSION_MINOR && (!suffix || version === PREV_VERSION)) return NEW_VERSION;
      return version;
    })
    .replaceAll(`https://deno.land/x/corejs@v${ PREV_VERSION }/`, `https://deno.land/x/corejs@v${ NEW_VERSION }/`)
    .replaceAll(/(?<=(?:["']core[Jj]s["']|\bcore[Jj]s)\s*:\s*["'])\d+\.\d+(?=["'])/g, replaceMinor)
    .replaceAll(/(?:["']corejs["']|\bcorejs)\s*:\s*\{[^}]*\}/g, updateVersionOption)
    .replaceAll(/["']polyfill-corejs3["']\s*,\s*\{[\S\s]*?\}\s*\]/g, updateVersionOption)
    .replaceAll(/\bcompat\s*\(\s*\{[\S\s]*?\}\s*\)/g, updateVersionOption)
    .replaceAll(/(?<=\bget(?:Entries|Modules)ListForTargetVersion\(\s*["']|["']core-js-compat\/get-modules-list-for-target-version["']\s*\)\s*\(\s*["'])\d+\.\d+(?=["']\s*\))/g, replaceMinor);
}

const license = await readFile(LICENSE, 'utf8');
const OLD_YEAR = +license.match(/2025–(?<year>\d{4}) C/).groups.year;
await writeFile(LICENSE, license.replaceAll(OLD_YEAR, CURRENT_YEAR));

for (const file of ['README.md', 'packages/core-js-compat/README.md', 'deno/corejs/README.md', 'docs/web/docs/usage.md']) {
  const text = await readFile(file, 'utf8');
  await writeFile(file, updateVersionDocs(text));
}

const shared = await readFile(SHARED, 'utf8');
await writeFile(SHARED, shared.replaceAll(PREV_VERSION, NEW_VERSION).replaceAll(OLD_YEAR, CURRENT_YEAR));

const builderConfig = await readFile(BUILDER_CONFIG, 'utf8');
await writeFile(BUILDER_CONFIG, builderConfig.replaceAll(OLD_YEAR, CURRENT_YEAR));

const packages = await Promise.all((await glob('packages/*/package.json')).map(async path => {
  const pkg = await readJson(path, 'utf8');
  return { path, pkg };
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
  await writeFile(CHANGELOG, changelog.replaceAll('### Unreleased', `### Unreleased\n- Nothing\n\n### [${
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
