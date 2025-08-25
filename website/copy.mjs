const { copy } = fs;

await copy('website/templates/assets', 'website/dist/assets');
await copy('website/templates/bundles', 'website/dist/bundles');

echo(chalk.green('Assets copied'));
