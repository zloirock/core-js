const { delimiter, dirname, normalize } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
const ROOT = cwd();
let FILE = args.shift();
const CD = FILE === 'cd';

if (CD) FILE = args.shift();

const DIR = dirname(FILE);

if (await pathExists(`${ DIR }/package.json`)) {
  cd(DIR);

  // after fixing the npm bug, use `--prefix ${ DIR }` instead of extra `cd`
  // https://github.com/npm/cli/issues/4819
  await $`npm install \
    --no-audit \
    --no-fund \
    --lockfile-version 3 \
    --loglevel error \
  `;

  const BIN = normalize(`${ cwd() }/node_modules/.bin`);

  if (await pathExists(BIN)) env.PATH = `${ BIN }${ delimiter }${ env.PATH }`;

  if (!CD) cd(ROOT);
} else if (CD) cd(DIR);

env.FORCE_COLOR = '1';

await import(`../${ FILE }`);
