const { delimiter, dirname, normalize } = path;
const { env } = process;
const file = argv._.shift();

cd(dirname(file));

await $`npm install --no-audit --no-fund --loglevel=error`;

env.PATH = `${ normalize(`${ process.cwd() }/node_modules/.bin`) }${ delimiter }${ env.PATH }`;
env.FORCE_COLOR = '1';

await import(`../${ file }`);
