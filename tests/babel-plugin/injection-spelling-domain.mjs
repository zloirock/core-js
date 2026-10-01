// The spelling of an injected import is chosen from three facts - what the body spells on the ESM
// side, what it spells on the CommonJS side, and whether the running method REMOVES any of that ESM
// - and the domain is small enough to enumerate rather than sample. Each cell is judged by what
// would LOAD the emitted file: an ESM statement and a top-level `require` in one file load nowhere,
// so a cell that emits both is a defect however the rule reached it. Two such cells were found by
// hand before this enumeration existed, one in each direction.
// BABEL_REQUIRE_FROM mirrors the fixture runner's hook so the suite runs under babel@8 (default)
// and babel@7 (with BABEL_REQUIRE_FROM=../babel-plugin-v7) alike.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { parseSync } from 'oxc-parser';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { createChecker } from '../polyfill-provider/harness.mjs';

const { check, finish } = createChecker('injection-spelling-domain');

function noop() { /* the bundler's warn hook, which this enumeration has no use for */ }

const { BABEL_REQUIRE_FROM } = process.env;
const requireBabel = BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformSync } = requireBabel('@babel/core');

const ESM_SIDE = [
  ['none', ''],
  ['bare foreign import', 'import "./a";\n'],
  ['bare core-js entry', 'import "core-js/actual/array/at";\n'],
  ['binding import', 'import { x } from "./x";\n'],
  ['export', 'export const e = 1;\n'],
  ['import.meta', 'const u = import.meta.url;\n'],
  ['top-level await', 'const w = await f();\n'],
];
const CJS_SIDE = [
  ['none', ''],
  ['module.exports', 'module.exports = 1;\n'],
  ['require call', 'require("x");\n'],
  ['__dirname', 'const d = __dirname;\n'],
];
// the usage methods need a claim to inject for; entry-global has the entry itself
const USE = '[1].at(0);\n';

// the statement types that make a printed file a Module to a loader
const ESM_STATEMENT_TYPES = new Set([
  'ExportAllDeclaration',
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ImportDeclaration',
]);
// what WE emit, as opposed to what the author may have written: the module paths of the global
// package and the entry paths of the pure one. An author's own `core-js/actual/...` entry is theirs
// - a usage method never removes it - and counting it as ours read those bodies as having no ESM
const OUR_SPECIFIER = /^(?:core-js\/modules\/|@core-js\/pure\/)/;

// What the emitted file would load as, judged against what the AUTHOR's own body is - not against
// the printed mixture. A source that already spells both module systems loads nowhere whatever we
// put in it, and `sourceIsMixed` reports that; the defect this enumeration is for is our injection
// adding a SECOND system to a body that had one
function verdictOf(code) {
  // eslint-disable-next-line node/no-sync -- oxc-parser only provides sync API
  const { program } = parseSync('/p.js', code, { lang: 'jsx', sourceType: 'module' });
  function ours(node) {
    return ESM_STATEMENT_TYPES.has(node.type)
      && typeof node.source?.value === 'string' && OUR_SPECIFIER.test(node.source.value);
  }
  // `import.meta` and top-level `await` are Module-only too, and neither is a statement - a check
  // that looked only at statement types read those bodies as CommonJS-only
  const authorESM = program.body.some(node => ESM_STATEMENT_TYPES.has(node.type) && !ours(node))
    || /\bimport\.meta\b/.test(code) || /(?:^|[^\w.])await\s/m.test(code);
  // both packages: the global method spells `core-js/modules/...`, the pure one `@core-js/pure/...`,
  // and a classifier that knew only the first read three quarters of the pure rows as "no injection"
  const ourRequire = /(?:^|=\s*)require\("(?:core-js\/modules\/|@core-js\/pure\/)/m.test(code);
  const ourImport = program.body.some(node => ours(node));
  const authorCJS = /\bmodule\.exports\b|\bexports\.\w|\b__dirname\b|\b__filename\b/.test(code)
    || /(?:^|[^"])\brequire\("(?!core-js\/modules\/|@core-js\/pure\/)/m.test(code);
  const injects = ourRequire || ourImport;
  if (authorESM && authorCJS) return { verdict: 'author-mixed', injects };
  if (authorESM && ourRequire) return { verdict: 'loads nowhere: our require beside the author\'s ESM', injects };
  if (authorCJS && ourImport) return { verdict: 'loads nowhere: our import beside the author\'s CommonJS', injects };
  return { verdict: ourRequire ? 'cjs' : ourImport ? 'esm' : 'no injection', injects };
}

const injected = new Map();
for (const method of ['entry-global', 'usage-global', 'usage-pure']) {
  for (const [esmLabel, esm] of ESM_SIDE) {
    for (const [cjsLabel, cjs] of CJS_SIDE) {
      const source = esm + cjs + (method === 'entry-global' ? '' : USE);
      if (!source.trim()) continue;
      // eslint-disable-next-line node/no-sync -- the enumeration is synchronous, and so is the compare
      const out = transformSync(source, {
        filename: '/p.mjs', babelrc: false, configFile: false, sourceType: 'module',
        plugins: [['../../packages/core-js-babel-plugin/index.js',
          { method, version: '4.0', targets: { ie: 11 } }]],
      })?.code ?? '';
      const { verdict, injects } = verdictOf(out);
      if (injects) injected.set(method, (injected.get(method) ?? 0) + 1);
      check(`spelling/${ method } esm=${ esmLabel } cjs=${ cjsLabel }`,
        verdict.startsWith('loads nowhere') ? `${ verdict }\n${ out }` : 'ok', 'ok');
      // the format owner is shared, so a cell the two legs spell differently is a binding defect -
      // and this enumeration is the only place the whole domain is asked of both
      // a leg that changed nothing answers `null`, and comparing that against the printed source
      // would read every untouched cell as a divergence
      const other = createUnplugin({ method, version: '4.0', targets: { ie: 11 } })
        .transform.call({ warn: noop }, source, '/p.mjs')?.code ?? source;
      check(`spelling/${ method } esm=${ esmLabel } cjs=${ cjsLabel } - both legs agree`,
        verdictOf(other).verdict, verdict);
    }
  }
}
// the enumeration means nothing unless the cells inject: a usage method has a claim in every one of
// them, while `entry-global` has something to do only where the ESM side spells the entry itself
check('spelling/every usage-global cell injects', injected.get('usage-global'), ESM_SIDE.length * CJS_SIDE.length);
check('spelling/every usage-pure cell injects', injected.get('usage-pure'), ESM_SIDE.length * CJS_SIDE.length);
check('spelling/entry-global injects exactly where the entry stands', injected.get('entry-global'), CJS_SIDE.length);

finish();
