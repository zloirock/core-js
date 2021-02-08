import { minify } from 'terser';
import builder from 'core-js-builder';
import config from 'core-js-builder/config.js';

const DENO = argv.deno;
const PATH = DENO ? './deno/corejs/' : './packages/core-js-bundle/';

function log(kind, name, code) {
  const size = (code.length / 1024).toFixed(2);
  // eslint-disable-next-line no-console -- output
  console.log(chalk.green(`${ kind }: ${ chalk.cyan(`${ PATH }${ name }.js`) }, size: ${ chalk.cyan(`${ size }KB`) }`));
}

async function bundle({ bundled, minified, options = {} }) {
  const source = await builder(options);

  log('bundling', bundled, source);
  await fs.writeFile(`${ PATH }${ bundled }.js`, source);

  if (!minified) return;

  const { code, map } = await minify(source, {
    ecma: 5,
    keep_fnames: true,
    compress: {
      hoist_funs: false,
      hoist_vars: true,
      pure_getters: true,
      passes: 3,
      unsafe_proto: true,
      unsafe_undefined: true,
    },
    format: {
      max_line_len: 32000,
      preamble: config.banner,
      webkit: false,
    },
    sourceMap: {
      url: `${ minified }.js.map`,
    },
  });

  await fs.writeFile(`${ PATH }${ minified }.js`, code);
  await fs.writeFile(`${ PATH }${ minified }.js.map`, map);
  log('minification', minified, code);
}

bundle(DENO ? {
  bundled: 'index',
  options: {
    targets: { deno: '1.0' },
    exclude: [
      'esnext.array.filter-out',       // obsolete
      'esnext.aggregate-error',        // moved to stable ES
      'esnext.global-this',            // moved to stable ES
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
      'esnext.promise.all-settled',    // moved to stable ES
      'esnext.promise.any',            // moved to stable ES
      'esnext.string.at',              // withdrawn
      'esnext.string.match-all',       // moved to stable ES
      'esnext.string.replace-all',     // moved to stable ES
      'esnext.symbol.pattern-match',   // is not a part of actual proposal, replaced by esnext.symbol.matcher
      'esnext.symbol.replace-all',     // obsolete
      'esnext.typed-array.filter-out', // obsolete
      'esnext.weak-map.upsert',        // obsolete
    ],
  },
} : {
  bundled: 'index',
  minified: 'minified',
});
