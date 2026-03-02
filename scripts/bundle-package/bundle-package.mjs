import builder from '@core-js/builder';

const { cyan, green } = chalk;
const ESMODULES = argv._.includes('esmodules');
const BUNDLED_NAME = argv._.includes('bundled-name') ? argv._[argv._.indexOf('bundled-name') + 1] : 'index';
const MINIFIED_NAME = argv._.includes('minified-name') ? argv._[argv._.indexOf('minified-name') + 1] : 'minified';
const PATH = 'packages/core-js-bundle/';

const options = ESMODULES ? { targets: { esmodules: true } } : {};

function log(kind, name, code) {
  const size = (code.length / 1024).toFixed(2);
  echo(green(`${ kind }: ${ cyan(`${ PATH }${ name }.js`) }, size: ${ cyan(`${ size }KB`) }`));
}

const { script } = await builder({ modules: 'full', minify: false, ...options });

log('bundling', BUNDLED_NAME, script);
await fs.writeFile(`${ PATH }${ BUNDLED_NAME }.js`, script);

const { script: minified } = await builder({ modules: 'full', minify: true, ...options });

await fs.writeFile(`${ PATH }${ MINIFIED_NAME }.js`, minified);
log('bundling minified', MINIFIED_NAME, minified);
