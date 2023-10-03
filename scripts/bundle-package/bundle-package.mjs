import { minify } from 'terser';
import builder from 'core-js-builder';
import config from 'core-js-builder/config.js';

function namedArg(name, fallback) {
  const idx = argv._.indexOf(name);
  return idx === -1 ? fallback : argv._[idx + 1];
}

const { cyan, green } = chalk;
const DENO = argv._.includes('deno');
const ESMODULES = argv._.includes('esmodules');
const BUNDLED_NAME = namedArg('bundled-name', 'index');
const MINIFIED_NAME = namedArg('minified-name', 'minified');
const PATH = DENO ? 'deno/corejs/' : 'packages/core-js-bundle/';

function log(kind, name, code) {
  const size = (code.length / 1024).toFixed(2);
  echo(green(`${ kind }: ${ cyan(`${ PATH }${ name }.js`) }, size: ${ cyan(`${ size }KB`) }`));
}

async function bundle({ bundled, minified, options = {} }) {
  const source = await builder(options);

  log('bundling', bundled, source);
  await fs.writeFile(`${ PATH }${ bundled }.js`, source);

  if (!minified) return;

  const { code, map } = await minify(source, {
    ecma: 3,
    ie8: true,
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

await bundle(DENO ? {
  bundled: BUNDLED_NAME,
  options: {
    targets: { deno: '1.0' },
    exclude: [
      'esnext.map.update-or-insert',   // obsolete
      'esnext.map.upsert',             // obsolete
      'esnext.symbol.pattern-match',   // is not a part of actual proposal, replaced by esnext.symbol.matcher
      'esnext.symbol.replace-all',     // obsolete
      'esnext.typed-array.filter-out', // obsolete
      'esnext.weak-map.upsert',        // obsolete
    ],
  },
} : {
  bundled: BUNDLED_NAME,
  minified: MINIFIED_NAME,
  options: ESMODULES ? { targets: { esmodules: true } } : {},
});
