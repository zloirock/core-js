const { copy } = fs;

await copy('website/templates/assets', 'website/dist/assets');
await copy('website/templates/core-js-bundle.js', 'website/dist/core-js-bundle.js');

echo(chalk.green('Assets copied'));
