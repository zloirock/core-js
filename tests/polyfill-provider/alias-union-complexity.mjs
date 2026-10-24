// The reachable-value union of an alias (`reachableAliasValues`) walks the hops of its sources as a graph: a source
// two hops spell is expanded once, however many paths reach it. A walk cut at a name on its own path instead
// enumerated every simple path of a ring of aliases copying one another - the loop of a text layout copying its
// line, word and measure into one another with an instance claim on each - a power of the copies. Count the
// binding lookups the detection makes over a ring of eight accumulators copied in k blocks and in 2k, both
// parsers, both methods: twice the blocks are twice the roots over twice the hops, so the lookups grow by a
// bounded factor; enumerated by path they grow past any factor, and past the ceiling here. And the union has a
// ceiling of its own: it follows at most 64 hop sources and keeps what they named - a constructor reached through
// the 64th source is named, one reached only through the 65th is not
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { aliasWriteCtorNames } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { checkDeep, checkTruthy, finish } = createChecker('alias-union-complexity');

function lines(count, line) {
  return Array.from({ length: count }, (unused, index) => line(index)).join('\n');
}

// `accumulators` strings copied into one another around a ring in `blocks` blocks, an instance claim on each copy
function copyLoop(accumulators, blocks) {
  function a(index) {
    return `a${ index % accumulators }`;
  }
  return `export function layout(text) {
  var out = [];
${ lines(accumulators, index => `  var ${ a(index) } = '';`) }
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
${ lines(blocks, k => `    ${ a(k + 2) } = ${ a(k + 3) }; out.push(${ a(k + 2) }.at(0)); ${ a(k + 1) } = ch + ${ a(k) }; ${ a(k + 3) } = ${ a(k + 1) }; out.push(${ a(k + 3) }.at(-1));`) }
  }
  return out;
}`;
}

// the binding lookups and the claims detecting `source` takes - the census pre-pass (pure) and every member read -
// the lookups cut short past `budget`: an unbounded walk must fail this suite, not hang it (`lookups: null`)
function detect({ parser, method, source, budget }) {
  const program = parser.parseAndScope(source);
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

// eight accumulators over 32 blocks take thousands of lookups; enumerated by path they pass this ceiling at 64
const CEILING = 200000;

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ method }`;
  const short = detect({ parser, method, source: copyLoop(8, 32), budget: CEILING });
  checkTruthy(`${ label }/the claims dispatch`, short.claims > 0, `${ short.claims } claims`);
  checkTruthy(`${ label }/the union is walked`, short.lookups > 0, `${ short.lookups ?? `past ${ CEILING }` } lookups`);
  if (short.lookups === null) continue;
  // twice the blocks: twice the roots over twice the hops, each hop expanded once per root
  const long = detect({ parser, method, source: copyLoop(8, 64), budget: short.lookups * 8 });
  checkTruthy(`${ label }/lookups stay polynomial in the blocks`, long.lookups !== null, `${ short.lookups } -> past ${ short.lookups * 8 }`);
}

// an alias with `sources` hop sources: a copy of `first` - the copy, `sources - 3` writes each reading Map and its init
// are the `sources - 1` sources met first - and a copy of `other`, met as the last source, whose write reads Object,
// which no other source reads and no name resolves to
function fan(sources) {
  return `let first = Map;\n${ lines(sources - 3, index => `if (c${ index }) first = Map;`) }\n`
    + 'let other = Map;\nif (c) other = Object;\nlet held = Map;\nif (d0) held = first;\nif (d1) held = other;\nobserve(held);';
}

const UNION_CEILING = 64;

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  for (const [sources, expected] of [[UNION_CEILING, ['Map', 'Object']], [UNION_CEILING + 1, ['Map']]]) {
    const program = parser.parseAndScope(fan(sources));
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method, resolvePure });
    const [usage] = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'observe').get('arguments');
    checkDeep(`${ parser.name }/${ method }/an alias with ${ sources } sources`,
      aliasWriteCtorNames({ name: 'held', scope: usage.scope, adapter, path: usage }), expected);
  }
}

finish();
