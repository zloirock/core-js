if (await which('bun', { nothrow: true })) {
  await Promise.all([
    ['packages/core-js/full/index', 'tests/bundles/unit-global'],
    ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
    ['tests/bundles/unit-pure'],
  ].map(files => $`bun qunit ${ files.map(file => `../../${ file }.js`) }`));
} else echo(chalk.cyan('bun is not found'));
