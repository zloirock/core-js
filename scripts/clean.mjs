await Promise.all((await glob([
  'tests/**/bundles/*',
  'packages/core-js/(actual|es|full|proposals|stable|stage|index.js)',
  'packages/core-js-pure/!(override|.npmignore|package.json|package.tpl.json|README.md)',
], { onlyFiles: false })).map(path => fs.rm(path, { force: true, recursive: true })));

echo(chalk.green('old copies removed'));
