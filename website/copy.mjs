const { copy } = fs;

await copy('website/templates/assets', 'website/dist/assets');
await copy('website/templates/bundles', 'website/dist/bundles');
await copy('website/templates/babel.min.js', 'website/dist/babel.min.js');

echo(chalk.green('Assets copied'));
