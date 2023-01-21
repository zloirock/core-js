const { cyan, green } = chalk;
const start = Date.now();
const pkgs = await fs.readdir('packages');

await Promise.all(pkgs.map(pkg => $`publint packages/${ pkg }`));

echo(green(`\npublint check passed in ${ cyan((Date.now() - start) / 1000) } seconds`));
