if (await which('deno', { nothrow: true })) {
  await Promise.all([
    ['packages/core-js/full/index', 'tests/bundles/unit-global'],
    ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
    ['tests/bundles/unit-pure'],
  ].map(files => $`deno run -A --no-config --no-lock --node-modules-dir=manual npm:qunit \
    --reporter ../unit-node/quiet-reporter.js \
    ${ ['tests/unit-deno/runtime-guard', ...files].map(file => `../../${ file }.js`) }`));
} else echo(chalk.cyan('deno is not found'));
