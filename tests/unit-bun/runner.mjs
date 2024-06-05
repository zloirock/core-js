if (await which('bun', { nothrow: true })) {
  await Promise.all([
    // some cases loading from modules works incorrectly in Bun, so test only bundled core-js version
    // ['packages/core-js/index', 'tests/bundles/unit-global'],
    ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
    ['tests/bundles/unit-pure'],
  ].map(files => $`bun ./tests/unit-bun/node_modules/.bin/qunit ${ files.map(file => `${ file }.js`) }`));
} else echo(chalk.cyan('bun is not found'));
