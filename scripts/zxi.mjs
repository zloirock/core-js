const { delimiter, dirname, normalize } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
const ROOT = cwd();
let FILE = args.shift();
const CD = FILE === 'cd';

if (CD) FILE = args.shift();

const DIR = dirname(FILE);
const PKG = pathExists(`${ DIR }/package.json`);

if (PKG) {
  cd(DIR);

  await $`npm install --no-audit --no-fund --loglevel=error`;

  const BIN = normalize(`${ cwd() }/node_modules/.bin`);

  if (pathExists(BIN)) env.PATH = `${ BIN }${ delimiter }${ env.PATH }`;

  if (!CD) cd(ROOT);
} else if (CD) cd(DIR);

env.FORCE_COLOR = '1';

await import(normalize(`${ ROOT }/${ FILE }`));
