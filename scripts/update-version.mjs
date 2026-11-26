import coerce from 'semver/functions/coerce.js';
import valid from 'semver/functions/valid.js';

const { readJson, readFile, writeJson, writeFile } = fs;
const { cyan, green, red } = chalk;

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
const README_BABEL_PLUGIN = 'packages/core-js-babel-plugin/README.md';
const README_COMPAT = 'packages/core-js-compat/README.md';
const README_TYPES = 'packages/core-js-types/README.md';
const README_UNPLUGIN = 'packages/core-js-unplugin/README.md';
const SHARED = 'packages/core-js/internals/shared-store.js';
const BUILDER_CONFIG = 'packages/core-js-builder/config.js';
const DOCS_USAGE = 'docs/web/docs/usage.md';
const DOCS_TYPES = 'docs/web/docs/typescript-type-definitions.md';
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();

const license = await readFile(LICENSE, 'utf8');
const OLD_YEAR = +license.match(/2025–(?<year>\d{4}) C/).groups.year;
await writeFile(LICENSE, license.replaceAll(OLD_YEAR, CURRENT_YEAR));

const npmInstall = /^[\t ]*npm[\t ]+(?:i|install)(?=[\t ])[^\n\r#&;|]*/gm;
const packageArgument = /(?<=\s)(?<quote>["']?)(?<name>core-js|@core-js\/(?:bundle|pure|types|unplugin))@(?<version>[^\s"']+)\k<quote>(?!\S)/g;
function updateInstallArgument(specifier, quote, name, version) {
  if (version === PREV_VERSION || name === '@core-js/types' && valid(version)) return `${ quote }${ name }@${ NEW_VERSION }${ quote }`;
  return specifier;
}

const versionDocs = new Set([README, README_BABEL_PLUGIN, README_COMPAT, README_UNPLUGIN, DOCS_USAGE]);
const minorExample = /(?<prefix>`|\bversion["']?\s*:\s*|get(?:Entries|Modules)ListForTargetVersion\()(?<quote>["'])(?<minor>\d+\.\d+)\k<quote>/g;
function updateMinorExample(match, prefix, quote, minor) {
  return minor === PREV_VERSION_MINOR ? `${ prefix }${ quote }${ NEW_VERSION_MINOR }${ quote }` : match;
}

for (const file of [...versionDocs, README_TYPES, DOCS_TYPES]) {
  let text = await readFile(file, 'utf8');
  text = text.replaceAll(npmInstall, command => command.replaceAll(packageArgument, updateInstallArgument));
  if (versionDocs.has(file)) text = text.replaceAll(minorExample, updateMinorExample);
  await writeFile(file, text);
}

const shared = await readFile(SHARED, 'utf8');
await writeFile(SHARED, shared.replaceAll(PREV_VERSION, NEW_VERSION).replaceAll(OLD_YEAR, CURRENT_YEAR));

const builderConfig = await readFile(BUILDER_CONFIG, 'utf8');
await writeFile(BUILDER_CONFIG, builderConfig.replaceAll(PREV_VERSION, NEW_VERSION).replaceAll(OLD_YEAR, CURRENT_YEAR));

const packages = await Promise.all((await glob('packages/*/package?(.tpl).json')).map(async path => {
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

await $`npm run build-compat`;

await $`npm run build-types`;

const UNRELEASED_TAG = `${ coerce(NEW_VERSION) }-unreleased`;

for (const name of ['modules-by-versions', 'entries-by-versions']) {
  const file = `packages/core-js-compat/${ name }.json`;
  const history = await readJson(file);
  if (history[UNRELEASED_TAG]) {
    history[NEW_VERSION] = history[UNRELEASED_TAG];
    delete history[UNRELEASED_TAG];
    await writeJson(file, history, { spaces: '  ' });
    echo(green(`${ name } updated`));
  } else echo(cyan(`${ name } update is not required`));
}
