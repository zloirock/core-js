const modulesByVersions = await fs.readJson('packages/core-js-compat/modules-by-versions.json');

for (const version of Object.keys(modulesByVersions)) {
  if (version.includes('unreleased')) {
    throw echo(chalk.red('`modules-by-versions` should not have `unreleased` pseudo-version. Please, rerun `update-version`.'));
  }
}
