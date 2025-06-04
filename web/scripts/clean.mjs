await Promise.all((await glob([
  'web/dist/**',
], { onlyFiles: false })).map(path => fs.rm(path, { force: true, recursive: true })));

echo(chalk.green('Old copies removed'));
