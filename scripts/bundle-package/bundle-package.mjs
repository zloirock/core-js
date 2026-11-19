import builder from '@core-js/builder';

const args = argv._.values();
const cliOptions = new Map();
for (const key of args) {
  const value = key === 'bundled-name' || key === 'minified-name' ? args.next().value : true;
  if (value === undefined) {
    console.error(`Missing bundle filename after ${ key }`);
    process.exitCode = 1;
    break;
  }
  if (!cliOptions.has(key)) cliOptions.set(key, value);
}

const { cyan, green } = chalk;
const ESMODULES = cliOptions.has('esmodules');
const BUNDLED_NAME = cliOptions.get('bundled-name') ?? 'index';
const MINIFIED_NAME = cliOptions.get('minified-name') ?? 'minified';
const PATH = 'packages/core-js-bundle/';

const options = ESMODULES ? { targets: { esmodules: true } } : {};

function log(kind, name, code) {
  const size = (code.length / 1024).toFixed(2);
  echo(green(`${ kind }: ${ cyan(`${ PATH }${ name }.js`) }, size: ${ cyan(`${ size }KB`) }`));
}

if (!process.exitCode) {
  const { script } = await builder({ modules: 'full', minify: false, ...options });

  log('bundling', BUNDLED_NAME, script);
  await fs.writeFile(`${ PATH }${ BUNDLED_NAME }.js`, script);

  const { script: minified } = await builder({ modules: 'full', minify: true, ...options });

  await fs.writeFile(`${ PATH }${ MINIFIED_NAME }.js`, minified);
  log('bundling minified', MINIFIED_NAME, minified);
}
