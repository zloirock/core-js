// A cursor reassigned in many guarded blocks to fresh nodes and to a slot read off itself (`node = node.prev`, a
// parser's or a tree walker's), its members read and written under guards testing it: a value read off the binding
// itself adds nothing to what a reader of the binding's values walks (`readsOffBindingItself`). count the binding
// lookups the detection makes over k blocks and over 2k - the census pre-pass and every member read, both parsers,
// both methods: a reader walking the binding again through each such write grows with a power of the blocks, and a
// union folding them into itself with their factorial
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { checkTruthy, finish } = createChecker('self-reading-writes-complexity');

// a member of the cursor pushed to, or a slot of it written: the census reads the written slot's receiver through
// the cursor's values (`overlay.ranges[last] = range` in `@lezer/common`)
const MEMBER_WRITES = {
  push: () => 'node.ranges.push(item)',
  'slot write': index => `node.ranges[${ index }] = item`,
};

function cursorSource(blocks, memberWrite) {
  const body = Array.from({ length: blocks }, (unused, index) => `    if (item.k${ index }) {
      if (node) node.depth++;
      node = new Node(node, ${ index });
    } else if (node && item.j${ index }) ${ memberWrite(index) };
    if (node && !--node.depth) node = node.prev;`);
  return `export function walk(list) {\n  let node = null;\n  for (const item of list) {\n${ body.join('\n') }\n  }\n}`;
}

// the binding lookups and the claims detecting `blocks` blocks makes, the lookups cut short past `budget` - an
// unbounded walk must fail this suite, not hang it (`lookups: null`)
function detect({ parser, method, memberWrite, blocks, budget = Infinity }) {
  const program = parser.parseAndScope(cursorSource(blocks, memberWrite));
  let mutated = null;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method, resolvePure, getMutatedStatics: () => mutated,
  });
  let lookups = 0;
  let claims = 0;
  const { getBinding } = adapter;
  adapter.getBinding = function (...args) {
    if (++lookups > budget) throw new RangeError('lookup budget exceeded');
    return getBinding.apply(this, args);
  };
  try {
    if (method === 'usage-pure') {
      const census = collectFileCensus(program.node, [mutationShapesReducer()]);
      mutated = (parser.name === 'babel'
        ? collectMutationPrePass(program, adapter, census)
        : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true })).mutated;
    }
    const core = createUsageHandlerCore({ adapter, method, resolvePure, onUsage() { claims++; } });
    for (const path of parser.collectPaths(program, 'MemberExpression')) core.emitMemberUsage(path);
    return { lookups, claims };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return { lookups: null, claims };
  }
}

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  for (const [spelling, memberWrite] of Object.entries(MEMBER_WRITES)) {
    const label = `${ parser.name }/${ method }/${ spelling }`;
    const short = detect({ parser, method, memberWrite, blocks: 6 });
    // twice the blocks: a detection quadratic in them makes about four times the lookups, one walking the cursor
    // again per such write eight times and more, one folding them into their own union thousands of times
    const long = detect({ parser, method, memberWrite, blocks: 12, budget: short.lookups * 5 });
    checkTruthy(`${ label }/the member reads claim`, short.claims > 0, `${ short.claims } claims`);
    checkTruthy(`${ label }/lookups stay quadratic in the blocks`, long.lookups !== null,
      `${ short.lookups } -> ${ long.lookups ?? `past ${ short.lookups * 5 }` }`);
  }
}

finish();
