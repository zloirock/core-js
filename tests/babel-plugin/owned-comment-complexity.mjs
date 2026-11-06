// The comments a destructuring statement owns are placed around its rewrite once the walk is done, and each
// statement reads only the region its rewrite spans: twice the commented statements cost at most twice the work.
// Counted, not timed: reads of the `type` and the `start` of every node a statement holds, and every `Map#get`
// and `Array#push`, through the whole transform - a pass that asks every statement of the list per statement
// shows as an excess
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createChecker } from '../polyfill-provider/harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import { walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { parse } = requireBabel('@babel/parser');
const { transformFromAstSync } = requireBabel('@babel/core');
const { checkTruthy, finish } = createChecker('owned-comment-complexity');

const SHAPES = {
  'declarations lifting their initializer effects': k => Array.from({ length: k },
    (unused, i) => `// owned ${ i }\nconst { from: f${ i } } = (log(${ i }), Array);\nuse(f${ i });`),
  'assignments lifting their effects': k => ['let a;', ...Array.from({ length: k },
    (unused, i) => `// owned ${ i }\n({ from: a } = (log(${ i }), Array));\nuse(a);`)],
  'declarations whose next statement owns a comment': k => Array.from({ length: k },
    (unused, i) => `const { of: o${ i } } = (log(${ i }), Array); // trailing ${ i }\n// owned ${ i }\nuse(o${ i });`),
};
const SIZES = [128, 256, 512];

const COUNTED_OPERATIONS = [[Map.prototype, 'get'], [Array.prototype, 'push']];
function reads(code) {
  const ast = parse(code, { sourceType: 'module' });
  const counter = { reads: 0 };
  for (const statement of ast.program.body) walkAstNodes({ root: statement, visit(node) {
    for (const key of ['type', 'start']) {
      const value = node[key];
      Object.defineProperty(node, key, { configurable: true, get() {
        counter.reads++;
        return value;
      } });
    }
  } });
  const originals = COUNTED_OPERATIONS.map(([prototype, key]) => prototype[key]);
  COUNTED_OPERATIONS.forEach(([prototype, key], at) => {
    prototype[key] = function (...args) {
      counter.reads++;
      return originals[at].apply(this, args);
    };
  });
  let out;
  try {
    // eslint-disable-next-line node/no-sync -- the counted window must not yield, or another suite runs inside it
    ({ code: out } = transformFromAstSync(ast, code, {
      plugins: [[plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
      cloneInputAst: false,
      configFile: false,
      babelrc: false,
      filename: 'input.mjs',
    }));
  } finally {
    COUNTED_OPERATIONS.forEach(([prototype, key], at) => {
      prototype[key] = originals[at];
    });
  }
  return { count: counter.reads, out };
}

for (const [shape, lines] of Object.entries(SHAPES)) {
  const counts = [];
  for (const k of SIZES) {
    const { count, out } = reads(lines(k).join('\n'));
    // the rewrite has to run, and has to keep the comments, or the count measures nothing
    checkTruthy(`${ shape }/${ k }: the rewrite lifts the effects`, out.includes(`log(${ k - 1 });\n`));
    checkTruthy(`${ shape }/${ k }: the comments survive`, out.includes(`// owned ${ k - 1 }\n`));
    counts.push(count);
  }
  for (let i = 1; i < SIZES.length; i++) {
    const ratio = counts[i] / counts[i - 1];
    checkTruthy(`${ shape }: ${ SIZES[i - 1] } -> ${ SIZES[i] } statements grow the reads ${ ratio.toFixed(4) }x, at most 2x`,
      ratio <= 2, counts.join(' -> '));
  }
}

finish();
