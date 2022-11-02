const { basename, dirname } = path;
const [file, ...params] = argv._;

cd(dirname(file));

await $`npm install --no-audit --no-fund --loglevel=error`;

process.env.FORCE_COLOR = '1';

await $`zx ${ basename(file) } ${ params }`;
