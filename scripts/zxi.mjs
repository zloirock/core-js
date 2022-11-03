const file = argv._.shift();

cd(path.dirname(file));

await $`npm install --no-audit --no-fund --loglevel=error`;

process.env.FORCE_COLOR = '1';

await import(`../${ file }`);
