const { dirname, resolve } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
const { cyan, green } = chalk;
const CD = args.includes('cd');
const TIME = args.includes('time');

if (CD) args.splice(args.indexOf('cd'), 1);
if (TIME) args.splice(args.indexOf('time'), 1);

const FILE = args.shift();
const DIR = dirname(FILE);

$.verbose = true;

if (await pathExists(`${ DIR }/package.json`)) {
  await $({ cwd: DIR })`npm install \
    --no-audit \
    --no-fund \
    --lockfile-version=3 \
    --loglevel=error \
    --force \
  `;

  $.preferLocal = [resolve(DIR), cwd()];
}

if (CD) cd(DIR);

env.FORCE_COLOR = '1';

const start = Date.now();

await import(`../${ FILE }`);

if (TIME) echo(green(`\n${ FILE } took ${ cyan((Date.now() - start) / 1000) } seconds`));
