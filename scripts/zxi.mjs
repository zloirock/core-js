const { delimiter, dirname, normalize } = path;
const { cwd, env } = process;
const root = cwd();
let file = argv._.shift();
const CD = file === 'cd';

if (CD) file = argv._.shift();

cd(dirname(file));

await $`npm install --no-audit --no-fund --loglevel=error`;

env.PATH = `${ normalize(`${ cwd() }/node_modules/.bin`) }${ delimiter }${ env.PATH }`;
env.FORCE_COLOR = '1';

if (!CD) cd(root);

await import(`../${ file }`);
