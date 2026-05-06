const modulesByVersions = await fs.readJson('packages/core-js-compat/modules-by-versions.json');

if (Object.keys(modulesByVersions).some(version => version.includes('unreleased'))) {
  throw echo(chalk.red('`modules-by-versions` should not have `unreleased` pseudo-version. Please, rerun `update-version`.'));
}

const entriesByVersions = await fs.readJson('packages/core-js-compat/entries-by-versions.json');

if (Object.keys(entriesByVersions).some(version => version.includes('unreleased'))) {
  throw echo(chalk.red('`entries-by-versions` should not have `unreleased` pseudo-version. Please, rerun `update-version`.'));
}
