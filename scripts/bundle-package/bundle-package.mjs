import { minify } from 'terser';
import builder, { formatSize } from 'core-js-builder';
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

function log(kind, file, code) {
  echo(green(`${ kind }: ${ cyan(file) }, size: ${ cyan(formatSize(code)) }`));
}

// a relative path as a relative URL: a raw `#`, `?` or `%` in a name would start a fragment, a query or an escape
function toURL(file) {
  return file.split(path.sep).map(encodeURIComponent).join('/');
}

async function bundle({ bundled, minified, options = {} }) {
  const source = await builder(options);
  const bundledFile = `${ PATH }${ bundled }.js`;

  log('bundling', bundledFile, source);
  await fs.outputFile(bundledFile, source);

  if (!minified) return;

  const minifiedFile = `${ PATH }${ minified }.js`;
  const minifiedName = path.basename(minifiedFile);

  // the map is written next to the minified file, so the map URL and the source URL are relative to its directory
  const { code, map } = await minify({ [toURL(path.relative(path.dirname(minifiedFile), bundledFile))]: source }, {
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
      // a classic script without `charset` is decoded in the encoding of the page
      ascii_only: true,
      max_line_len: 32000,
      preamble: config.banner,
      webkit: true,
      // https://v8.dev/blog/preparser#pife
      wrap_func_args: false,
    },
    sourceMap: {
      filename: minifiedName,
      url: `${ toURL(minifiedName) }.map`,
    },
  });

  await fs.outputFile(minifiedFile, code);
  await fs.outputFile(`${ minifiedFile }.map`, map);
  log('minification', minifiedFile, code);
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
