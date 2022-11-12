const { delimiter, dirname, normalize } = path;
const { pathExists } = fs;
const { cwd, env } = process;
const { _: args } = argv;
let FILE = args.shift();
const CD = FILE === 'cd';

if (CD) FILE = args.shift();

const DIR = dirname(FILE);

if (await pathExists(`${ DIR }/package.json`)) {
  await $`npm install \
    --prefix ${ DIR } \
    --legacy-peer-deps \
    --no-audit \
    --no-fund \
    --loglevel=error \
  `;

  const BIN = normalize(`${ cwd() }/${ DIR }/node_modules/.bin`);

  if (await pathExists(BIN)) env.PATH = `${ BIN }${ delimiter }${ env.PATH }`;
}

if (CD) cd(DIR);

env.FORCE_COLOR = '1';

await import(`../${ FILE }`);
