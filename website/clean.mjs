await fs.rm('website/dist/', { force: true, recursive: true });

echo(chalk.green('Old copies removed'));
