// The escape census ties a write through a selection arm to the container the arm may hold once an end of the
// route holds a static owner. It asks only of the values a route may land on - by spelling first, one answer per
// container and name, and exactly, walking the containers a value reaches, only where the spelling may: asking
// through the value walk re-reads the chain below every link of a selection chain, and asking each holder alone
// re-reads a chain of containers below every link of it. So the drawing is counted in reads of the nodes such a
// walk re-reads, not timed: asking each once doubles the reads with the chain, walking the chain per link grows
// them with its length
import { createChecker } from './harness.mjs';
import { collectFileCensus, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkTruthy, finish, runBoth } = createChecker('alias-class-complexity');

// a chain of selections whose every link may hold the container or the next link, or whose last link alone holds
// it; the write through the head of the chain may land on the container either way. and a chain of containers,
// each holding the constructor and the one before it, with a selection landing on the last: every link is an
// owner, the route lands on one - or each holding the one before it, the constructor at the bottom alone, with a
// selection landing on every link: every link is an owner through the links below it
const SHAPES = {
  'every link holds the container': {
    type: 'ConditionalExpression',
    code: size => [
      'const box = { C: Map };',
      ...Array.from({ length: size }, (unused, k) => `var s${ k } = c ? box : s${ k + 1 };`),
      's0.C = user;',
      'box.C.groupBy([], x => x);',
    ],
  },
  'the last link holds the container': {
    type: 'ConditionalExpression',
    code: size => [
      'const box = { C: Map };',
      ...Array.from({ length: size }, (unused, k) => `var s${ k } = c ? other${ k } : s${ k + 1 };`),
      `var s${ size } = box;`,
      's0.C = user;',
      'box.C.groupBy([], x => x);',
    ],
  },
  'a route lands on the last of a chain of owners': {
    type: 'ObjectExpression',
    code: size => [
      'const k0 = { C: Map };',
      ...Array.from({ length: size }, (unused, k) => `const k${ k + 1 } = { C: Map, n: k${ k } };`),
      'const spare = {};',
      `const via = c ? k${ size } : spare;`,
      'via.C = user;',
      `k${ size }.C.groupBy([], x => x);`,
    ],
  },
  'routes land on every link of a chain holding the owner at its bottom': {
    type: 'ObjectExpression',
    code: size => [
      'const spare = {};',
      'const k0 = { C: Map };',
      ...Array.from({ length: size }, (unused, k) => `const k${ k + 1 } = { n: k${ k } };`),
      ...Array.from({ length: size + 1 }, (unused, k) => `const via${ k } = c ? k${ k } : spare;`),
      'via0.C = user;',
      'k0.C.groupBy([], x => x);',
    ],
  },
};

const counts = new Map();
for (const [shape, { type, code }] of Object.entries(SHAPES)) for (const size of [64, 128, 256]) {
  runBoth(`${ shape }/${ size }`, code(size).join('\n'), (parser, program, label) => {
    let reads = 0;
    walkAstNodes({ root: program.node, visit(node) {
      if (node.type !== type) return;
      Object.defineProperty(node, 'type', { configurable: true, get() {
        reads++;
        return type;
      } });
    } });
    const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
    // the write may unseat the constructor the read names: a drawing that skipped the chain is fast for free
    check(`${ label }: the read keeps the statics in pure`, escapedCtorNames.has('Map', true), true);
    counts.set(`${ parser.name }/${ shape }/${ size }`, reads);
  });
}
for (const series of new Set(counts.keys().map(key => key.slice(0, key.lastIndexOf('/'))))) {
  for (const [small, large] of [[64, 128], [128, 256]]) {
    const ratio = counts.get(`${ series }/${ large }`) / counts.get(`${ series }/${ small }`);
    checkTruthy(`${ series }: ${ small } -> ${ large } links grows the reads ${ ratio.toFixed(2) }x, at most 2.5x`, ratio <= 2.5);
  }
}
finish();
