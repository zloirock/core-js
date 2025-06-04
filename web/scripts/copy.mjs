const { copy } = fs;

await copy('web/templates/assets', 'web/dist/assets');

echo(chalk.green(`Assets copied`));
