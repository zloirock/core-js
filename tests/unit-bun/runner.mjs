if (await which('bun', { nothrow: true })) {
  // without `--bun`, Bun runs the qunit bin by its `#!/usr/bin/env node` shebang on the node in PATH,
  // so every leg carries a guard that fails anywhere but on Bun
  await Promise.all([
    ['packages/core-js/full/index', 'tests/bundles/unit-global'],
    ['tests/unit-bun/bundle-leg'],
    ['tests/bundles/unit-pure'],
  ].map(files => $`bun --bun qunit --reporter ../unit-node/quiet-reporter.js ${ ['tests/unit-bun/runtime-guard', ...files].map(file => `../../${ file }.js`) }`));
} else echo(chalk.cyan('bun is not found'));
