await import('./tests/all-platforms.mjs');
await import('./tests/evaluate.mjs');
await import('./tests/helpers.mjs');
await import('./tests/abort.mjs');
await import('./tests/pages.mjs');
await import('./tests/platforms.mjs');
await import('./tests/qunit-results.mjs');
await import('./tests/webdriver.mjs');

echo(chalk.green('Sauce Labs runner tested'));
