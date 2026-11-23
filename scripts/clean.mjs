await Promise.all((await glob([
  'tests/**/bundles/*',
  // The generated features/ layer can be left over from v3.
  'packages/core-js/(actual|es|features|full|proposals|stable|stage|index.js)',
  'packages/core-js-pure/!(override|.npmignore|package.json|package.tpl.json|README.md|AGENTS.md)',
], { onlyFiles: false })).map(path => fs.rm(path, { force: true, recursive: true })));

echo(chalk.green('old copies removed'));
