// The escape census ties a write through a selection arm to the container the arm may hold once an end of the
// route holds a static owner. It asks only of the values a route may land on - by spelling first, one answer per
// container and name, and exactly, walking the containers a value reaches, only where the spelling may: asking
// through the value walk re-reads the chain below every link of a selection chain, and asking each holder alone
// re-reads a chain of containers below every link of it. So the drawing is counted in reads of the nodes such a
// walk re-reads, not timed: asking each once doubles the reads with the chain, walking the chain per link grows
// them with its length
import { createChecker } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, walkAstNodes, withTraversalCaches } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';

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

// Numeric values written through many slots cannot carry a static owner. Their alias history
// must not be expanded once per store; a constructor written later through an alias still escapes.
for (const size of [32, 64]) for (const reversed of [false, true]) {
  const code = [
    'const sink = {}; let value = 0;',
    ...Array.from({ length: size }, (unused, index) => `value = ${ index + 1 }; sink.k${ index } = value;`),
    'const box = {}, other = {}; const via = flag ? box : other; via.C = Map; use(box);',
  ];
  runBoth(`numeric stores/${ size }/reversed=${ reversed }`, code.join('\n'), (parser, program, label) => {
    let reads = 0;
    for (const { node } of parser.collectPaths(program, parser.name === 'babel' ? 'NumericLiteral' : 'Literal')) {
      const { type } = node;
      Object.defineProperty(node, 'type', { configurable: true, get() {
        reads++;
        return type;
      } });
    }
    const reducers = [escapedCtorReferencesReducer(), mutationShapesReducer()];
    const { escapedCtorNames } = collectFileCensus(program.node, reversed ? reducers.reverse() : reducers);
    check(`${ label }: the stored constructor escapes in global`, escapedCtorNames.has('Map'), true);
    check(`${ label }: the stored constructor escapes in pure`, escapedCtorNames.has('Map', true), true);
    checkTruthy(`${ label }: numeric source reads are observed`, reads > size);
    checkTruthy(`${ label }: numeric source reads stay linear`, reads < size * 160);
  });
}

// ... and a binding many aliases hold (`const hK = box`) is asked at every call through one of them whether something
// opens it: the walk answering that steps through the aliases once per binding, and asked anew per call it stepped
// through all of them again. no read of the tree shows those steps - each files the alias it enters in a set - so
// count the entries the sets take during the census
const entries = new Map();
for (const size of [64, 128, 256]) {
  const code = [
    'const box = { a: Math };',
    ...Array.from({ length: size }, (unused, k) => `const h${ k } = box; h${ k }.a = Array;`),
    ...Array.from({ length: size }, (unused, k) => `box.a.of(${ k });`),
  ];
  runBoth(`aliased owner/${ size }`, code.join('\n'), (parser, program, label) => {
    const { add } = Set.prototype;
    let count = 0;
    // eslint-disable-next-line no-extend-native -- counts the census's set entries, restored below
    Set.prototype.add = function (value) {
      count++;
      return add.call(this, value);
    };
    try {
      collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
    } finally {
      // eslint-disable-next-line no-extend-native -- the native method back
      Set.prototype.add = add;
    }
    checkTruthy(`${ label }: set entry counter control`, count > 0, `${ count } entries`);
    entries.set(`${ parser.name }/${ size }`, count);
  });
}
for (const series of new Set(entries.keys().map(key => key.slice(0, key.lastIndexOf('/'))))) {
  for (const [small, large] of [[64, 128], [128, 256]]) {
    const ratio = entries.get(`${ series }/${ large }`) / entries.get(`${ series }/${ small }`);
    checkTruthy(`${ series }/aliased owner: ${ small } -> ${ large } aliases grows the set entries ${ ratio.toFixed(2) }x, at most 2.5x`, ratio <= 2.5);
  }
}

// ... and every read of the slot those aliases write (`box.a.of(k)`) asks whether a write replaced what the literal
// held: the constructor every write names is the writes' own fact, named once per owner of the reads
// (`agreedSlotWriteName`), and the dominance stops at the first write that proves it - asked per read over every
// write, each read walked all of them again. count the reads of the written values
const slotReads = new Map();
for (const size of [64, 128, 256]) {
  const code = [
    'const box = { a: Math };',
    ...Array.from({ length: size }, (unused, k) => `const h${ k } = box; h${ k }.a = Array;`),
    ...Array.from({ length: size }, (unused, k) => `box.a.of(${ k });`),
  ];
  runBoth(`aliased slot reads/${ size }`, code.join('\n'), (parser, program, label) => {
    const census = collectFileCensus(program.node, [mutationShapesReducer()]);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-global',
      getWrittenContainerSlots: () => census.writtenContainerSlots,
      getContainerSlotIndex: () => census.containerSlotIndex,
    });
    let reads = 0;
    for (const { node: write } of parser.collectPaths(program, 'AssignmentExpression')) {
      const { right } = write;
      Object.defineProperty(write, 'right', {
        configurable: true,
        enumerable: true,
        get() {
          reads++;
          return right;
        },
      });
    }
    let named = 0;
    const core = createUsageHandlerCore({ adapter, method: 'usage-global', onUsage(meta) {
      if (meta.object === 'Array' && meta.key === 'of') named++;
    } });
    const slotReadPaths = parser.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'of');
    withTraversalCaches(true, () => {
      for (const path of slotReadPaths) core.emitMemberUsage(path);
    });
    // the writes replaced the literal's constructor: each read names the one they install
    check(`${ label }: every read names the written constructor`, named, size);
    slotReads.set(`${ parser.name }/${ size }`, reads);
  });
}
for (const series of new Set(slotReads.keys().map(key => key.slice(0, key.lastIndexOf('/'))))) {
  for (const [small, large] of [[64, 128], [128, 256]]) {
    const ratio = slotReads.get(`${ series }/${ large }`) / slotReads.get(`${ series }/${ small }`);
    checkTruthy(`${ series }/aliased slot reads: ${ small } -> ${ large } aliases grows the written-value reads ${ ratio.toFixed(2) }x, at most 2.5x`, ratio <= 2.5);
  }
}
finish();
