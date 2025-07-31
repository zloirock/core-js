const { copy } = fs;

await copy('website/templates/assets', 'website/dist/assets');
await copy('website/templates/core-js-bundle.js', 'website/dist/core-js-bundle.js');
await copy('website/templates/core-js-bundle-modern.js', 'website/dist/core-js-bundle-modern.js');

echo(chalk.green('Assets copied'));
