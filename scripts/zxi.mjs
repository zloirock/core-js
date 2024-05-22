const { delimiter, dirname, normalize } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
const { cyan, green } = chalk;
const ROOT = cwd();
const CD = args.includes('cd');
const TIME = args.includes('time');

if (CD) args.splice(args.indexOf('cd'), 1);
if (TIME) args.splice(args.indexOf('time'), 1);

const FILE = args.shift();
const DIR = dirname(FILE);

$.preferLocal = true;
$.verbose = true;

if (await pathExists(`${ DIR }/package.json`)) {
  cd(DIR);

  // after fixing the npm bug, use `--prefix ${ DIR }` instead of extra `cd`
  // https://github.com/npm/cli/issues/4819
  await $`npm install \
    --no-audit \
    --no-fund \
    --lockfile-version=3 \
    --loglevel=error \
    --force \
  `;

  const BIN = normalize(`${ cwd() }/node_modules/.bin`);

  if (await pathExists(BIN)) env.PATH = `${ BIN }${ delimiter }${ env.PATH }`;

  if (!CD) cd(ROOT);
} else if (CD) cd(DIR);

env.FORCE_COLOR = '1';

const start = Date.now();

await import(`../${ FILE }`);

if (TIME) echo(green(`\n${ FILE } took ${ cyan((Date.now() - start) / 1000) } seconds`));
