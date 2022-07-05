const files = [
  'browsers-runner.js',
  'compat-data.js',
  'tests.js',
  'index.html',
];

for (const file of files) await fs.copy(`tests/compat/${ file }`, `docs/compat/${ file }`);

echo(chalk.green('compat table copied'));
