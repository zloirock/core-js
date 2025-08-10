import { minify } from 'terser';
import builder from '@core-js/builder';
import config from '@core-js/builder/config.js';

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
  const { script } = await builder({ modules: 'full', ...options });

  log('bundling', bundled, script);
  await fs.writeFile(`${ PATH }${ bundled }.js`, script);

  const { code, map } = await minify(script, {
    ecma: 5,
    safari10: true,
    keep_fnames: true,
    compress: {
      hoist_funs: true,
      hoist_vars: true,
      passes: 2,
      pure_getters: true,
      // document.all detection case
      typeofs: false,
      unsafe_proto: true,
      unsafe_undefined: true,
    },
    format: {
      max_line_len: 32000,
      preamble: config.banner,
      webkit: true,
      // https://v8.dev/blog/preparser#pife
      wrap_func_args: false,
    },
    sourceMap: {
      url: `${ minified }.js.map`,
    },
  });

  await fs.writeFile(`${ PATH }${ minified }.js`, code);
  await fs.writeFile(`${ PATH }${ minified }.js.map`, map);
  log('minification', minified, code);
}

await bundle({
  bundled: BUNDLED_NAME,
  minified: MINIFIED_NAME,
  options: ESMODULES ? { targets: { esmodules: true } } : {},
});
