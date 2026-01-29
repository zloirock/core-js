import builder from '@core-js/builder';

const { cyan, green } = chalk;
const ESMODULES = argv._.includes('esmodules');
const BUNDLED_NAME = argv._.includes('bundled-name') ? argv._[argv._.indexOf('bundled-name') + 1] : 'index';
const MINIFIED_NAME = argv._.includes('minified-name') ? argv._[argv._.indexOf('minified-name') + 1] : 'minified';
const PATH = 'packages/core-js-bundle/';

function log(kind, name, code) {
  const size = (code.length / 1024).toFixed(2);
  echo(green(`${ kind }: ${ cyan(`${ PATH }${ name }.js`) }, size: ${ cyan(`${ size }KB`) }`));
}

async function bundle({ bundled, minified, options = {} }) {
  const { script, map } = await builder({ modules: 'full', ...options });

  log('bundling minified', minified, script);
  await fs.writeFile(`${ PATH }${ minified }.js`, script);
  await fs.writeFile(`${ PATH }${ minified }.js.map`, map);

  const { script: script2, map: map2 } = await builder({ modules: 'full', minify: false, ...options });

  log('bundling regular', bundled, script2);
  await fs.writeFile(`${ PATH }${ bundled }.js`, script2);
  await fs.writeFile(`${ PATH }${ bundled }.js.map`, map2);
}

await bundle({
  bundled: BUNDLED_NAME,
  minified: MINIFIED_NAME,
  options: ESMODULES ? { targets: { esmodules: true } } : {},
});
