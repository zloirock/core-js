import { minify } from 'terser';
import builder from 'core-js-builder';
import config from 'core-js-builder/config.js';

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
const DENO = cliOptions.has('deno');
const ESMODULES = cliOptions.has('esmodules');
const BUNDLED_NAME = cliOptions.get('bundled-name') ?? 'index';
const MINIFIED_NAME = cliOptions.get('minified-name') ?? 'minified';
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

if (!process.exitCode) await bundle(DENO ? {
  bundled: BUNDLED_NAME,
  options: {
    targets: { deno: '1.0' },
    exclude: [
      'esnext.array.filter-out',       // obsolete
      'esnext.map.update-or-insert',   // obsolete
      'esnext.map.upsert',             // obsolete
      'esnext.math.iaddh',             // withdrawn
      'esnext.math.imulh',             // withdrawn
      'esnext.math.isubh',             // withdrawn
      'esnext.math.seeded-prng',       // changing of the API, waiting for the spec text
      'esnext.math.umulh',             // withdrawn
      'esnext.object.iterate-entries', // withdrawn
      'esnext.object.iterate-keys',    // withdrawn
      'esnext.object.iterate-values',  // withdrawn
      'esnext.string.at',              // withdrawn
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
