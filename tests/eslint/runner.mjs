const { cyan, green } = chalk;
const dir = path.dirname(import.meta.url).slice(7);

cd('../..');

process.env.ESLINT_USE_FLAT_CONFIG = true;

const start = Date.now();

await $`${ dir }/node_modules/.bin/eslint --config ${ dir }/eslint.config.js ./`;

echo(green(`\neslint check passed in ${ cyan((Date.now() - start) / 1000) } seconds`));
