await Promise.all([
  'browsers-runner.js',
  'compat-data.js',
  'tests.js',
  'index.html',
].map(file => fs.copy(`tests/compat/${ file }`, `docs/compat/${ file }`)));

echo(chalk.green('compat table copied'));
