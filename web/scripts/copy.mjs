const { copy } = fs;

await copy('web/templates/assets', 'web/dist/assets');
await copy('web/templates/core-js-bundle.js', 'web/dist/core-js-bundle.js');

echo(chalk.green(`Assets copied`));
