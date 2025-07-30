const { copy } = fs;

await copy('web-site/templates/assets', 'web-site/dist/assets');
await copy('web-site/templates/core-js-bundle.js', 'web-site/dist/core-js-bundle.js');

echo(chalk.green('Assets copied'));
