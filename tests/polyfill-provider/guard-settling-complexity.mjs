// A guard's settling that reaches one in flight takes its guards open and keeps no answer for good
// (`decidedGuards`), and asked again under the same settling it was settled anew - so a loop writing its
// accumulators under tests of one another (a text wrapper's lines, words and widths) settled every write of the
// others under every settling that reached it: a power of the writes. Such an answer is kept while the settling it
// took as open is in flight. Count the guard decisions (`adapter.settledSelection`) detecting such a loop takes over
// w guard blocks and over 2w, both parsers, both methods - the member reads and every selection the visitors decide:
// kept, the count grows by a bounded factor; settled anew, by a power. Then the keep itself, on a pair of writes
// guarding one another: a settling reached twice under one in flight is settled once, settled afresh once that
// settling completed, and kept for good after that
import { collectMutationPrePass, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus, withReentrantQuestion, writeNeverRuns } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('guard-settling-complexity');

function lines(count, line) {
  return Array.from({ length: count }, (unused, index) => line(index)).join('\n');
}

// a text wrapper's loop: `accumulators` strings written in `blocks` guard blocks, each block's tests reading other
// accumulators than the ones its arms write, and a claim inside every arm
function wrapLoop(accumulators, blocks) {
  function a(index) {
    return `a${ index % accumulators }`;
  }
  return `export function wrap(text) {
  var lines = [];
${ lines(accumulators, index => `  var ${ a(index) } = '';`) }
  for (var i = 0; i < text.length; i++) {
    var ch = text.charAt(i);
${ lines(blocks, k => `    if (!${ a(k) }) {
      if (${ a(k + 1) }) { ${ a(k + 2) } = ${ a(k + 3) }; lines.push(${ a(k + 2) }); ${ a(k + 3) } = ''; }
      else { ${ a(k + 2) } += ch; lines.push(${ a(k + 1) }); }
    } else if (${ a(k + 1) } || ${ a(k + 2) }) {
      ${ a(k + 1) } = ch; ${ a(k + 3) } = ${ a(k + 1) };
    }`) }
  }
  return lines;
}`;
}

function makeAdapter(parser, method, getMutatedStatics) {
  return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method, resolvePure, getMutatedStatics });
}

// counts the guard decisions `adapter` takes, cut short past `budget` - an unbounded settling must fail this suite,
// not hang it
function countDecisions(adapter, budget) {
  let count = 0;
  const { settledSelection } = adapter;
  adapter.settledSelection = function (...args) {
    if (++count > budget) throw new RangeError('decision budget exceeded');
    return settledSelection.apply(this, args);
  };
  return () => count;
}

// the guard decisions and the claims detecting `source` takes - the census pre-pass (pure), every member read and
// every selection the visitors decide (an `if` in usage-global alone, as `deadBranchOf` asks) - `count: null` past
// the budget
function detect({ parser, method, source, budget }) {
  const program = parser.parseAndScope(source);
  let mutated = null;
  const adapter = makeAdapter(parser, method, () => mutated);
  const decisions = countDecisions(adapter, budget);
  let claims = 0;
  try {
    if (method === 'usage-pure') {
      const census = collectFileCensus(program.node, [mutationShapesReducer()]);
      mutated = (parser.name === 'babel'
        ? collectMutationPrePass(program, adapter, census)
        : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true })).mutated;
    }
    const core = createUsageHandlerCore({ adapter, method, resolvePure, onUsage() { claims++; } });
    for (const path of parser.collectPaths(program, 'MemberExpression')) core.emitMemberUsage(path);
    const selections = ['LogicalExpression', 'ConditionalExpression', ...method === 'usage-global' ? ['IfStatement'] : []];
    for (const type of selections) {
      for (const path of parser.collectPaths(program, type)) adapter.decidedSelection(path.node, { scope: path.scope, adapter, path });
    }
    return { count: decisions(), claims };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return { count: null, claims };
  }
}

// three accumulators over three blocks settle in the hundreds; settled anew under every settling that reached them
// they pass this ceiling at two blocks already
const CEILING = 20000;

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ method }`;
  const short = detect({ parser, method, source: wrapLoop(3, 3), budget: CEILING });
  checkTruthy(`${ label }/the member reads claim`, short.claims > 0, `${ short.claims } claims`);
  checkTruthy(`${ label }/the guards are settled`, short.count > 0, `${ short.count ?? `past ${ CEILING }` } decisions`);
  if (short.count === null) continue;
  // twice the blocks: twice the writes under twice the tests, each settled once per settling in flight
  const long = detect({ parser, method, source: wrapLoop(3, 6), budget: short.count * 8 });
  checkTruthy(`${ label }/decisions stay polynomial in the blocks`, long.count !== null, `${ short.count } -> past ${ short.count * 8 }`);
}

// a write of `a` under two guards reading `b`, a write of `b` under a guard reading `a`, and a read of `a` after
// both. settling the write of `a` resolves `b` in each guard: the write of `b` is settled under it, and its guard
// reads `a`, whose write is in flight - the cut. the second guard takes the answer the first computed
const CYCLE = 'let a = Array;\nlet b = Map;\nif (!b) if (!b) a = Shim;\nif (!a) b = Shim2;\nexport const r = a.from(list);';

// the cycle parsed by `parser` for `method`: its adapter counting decisions, the read of `a`, the two writes, and
// `neverRuns` - a write's never-run answer with the decisions it took
function cycleProbe(parser, method) {
  const program = parser.parseAndScope(CYCLE);
  const adapter = makeAdapter(parser, method, () => null);
  const decisions = countDecisions(adapter, CEILING);
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'a');
  const [writeA, writeB] = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  function neverRuns(write) {
    const before = decisions();
    const dead = writeNeverRuns({ write, usagePath: read, adapter });
    return { dead, decisions: decisions() - before };
  }
  return { adapter, decisions, read, writeA, writeB, neverRuns };
}

for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ method }`;
  const { writeA, writeB, neverRuns } = cycleProbe(parser, method);
  // `b` holds Map where the guards of `a`'s write read it - its own write stands after them - so pure decides them
  // and the write of `a` never runs; usage-global resolves an alias by what it may hold and decides nothing
  const first = neverRuns(writeA);
  check(`${ label }/the guards of the first write decide`, first.dead, method === 'usage-pure');
  // the two hosts of the write of `a`, and the host of the write of `b` once
  check(`${ label }/a settling reached twice under one in flight is settled once`, first.decisions, 3);
  // ... whose answer left with the settling it took as open: asked on its own it is settled afresh, ...
  const second = neverRuns(writeB);
  check(`${ label }/the guards of the second write decide`, second.dead, method === 'usage-pure');
  check(`${ label }/settled afresh once that settling completed`, second.decisions, 1);
  // ... and kept for good then, as the first write's answer was: a cut by its own re-entry alone
  check(`${ label }/kept for good after that`, neverRuns(writeB).decisions, 0);
  check(`${ label }/the first write's answer was kept for good`, neverRuns(writeA).decisions, 0);
}

// ... and the keep holds in each narrowing context alike (`narrowingQuestions`): asked under a census pre-pass, a
// decision-root lookup or a binding lookup in flight, the nested settling is still settled once per ask of `a`'s write
for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) for (const kind of ['census', 'root', 'lookup']) {
  const label = `${ parser.name }/${ method }/${ kind }`;
  const { writeA, neverRuns } = cycleProbe(parser, method);
  const first = withReentrantQuestion(() => neverRuns(writeA), kind);
  check(`${ label }/the guards decide as in the plain context`, first.dead, method === 'usage-pure');
  check(`${ label }/the nested settling is settled once`, first.decisions, 3);
}

// a settling a decision throws out of leaves nothing in flight and no answer that took it as open: the next ask
// settles the same write from the start, as the first ask did
for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ method }`;
  const { adapter, decisions, writeA, neverRuns } = cycleProbe(parser, method);
  // the second decision is the nested settling of `b`'s write, asked by the first guard of `a`'s
  const { settledSelection } = adapter;
  adapter.settledSelection = function (...args) {
    if (decisions() === 1) throw new Error('decision abandoned');
    return settledSelection.apply(this, args);
  };
  let thrown = null;
  try {
    neverRuns(writeA);
  } catch (error) {
    thrown = error.message;
  }
  check(`${ label }/the abandoned decision left the settling`, thrown, 'decision abandoned');
  adapter.settledSelection = settledSelection;
  check(`${ label }/the next ask settles from the start`, neverRuns(writeA).decisions, 3);
}

finish();
