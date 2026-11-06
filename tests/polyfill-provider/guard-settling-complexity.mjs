// A guard's settling that reaches one in flight takes its guards open and keeps no answer for good
// (`decidedGuards`), and asked again under the same settling it was settled anew - so a loop writing its
// accumulators under tests of one another (a text wrapper's lines, words and widths) settled every write of the
// others under every settling that reached it: a power of the writes. Such an answer is kept while the settling it
// took as open is in flight. Count the guard decisions (`adapter.settledSelection`) detecting such a loop takes over
// w guard blocks and over 2w, both parsers, both methods - the member reads and every selection the visitors decide:
// kept, the count grows by a bounded factor; settled anew, by a power. Then the keep itself, on a pair of writes
// guarding one another: a settling reached twice under one in flight is settled once, settled afresh once that
// settling completed, and kept for good after that
import { collectPrePassSites as collectBabelPrePassSites, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  collectFileCensus, cutDeepWalk, cycleGuardHas, readDecidesWrite, refuseReentry, withReentrantQuestion, writeNeverRuns,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { createUsageHandlerCore } from '../../packages/core-js-polyfill-provider/detect-usage/visitors.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkTruthy, finish, throwsWith } = createChecker('guard-settling-complexity');

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
        ? collectBabelPrePassSites(program, adapter, census)
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
function cycleProbe(parser, method, source = CYCLE) {
  const program = parser.parseAndScope(source);
  const adapter = makeAdapter(parser, method, () => null);
  const decisions = countDecisions(adapter, CEILING);
  const read = parser.pickPath(program, 'MemberExpression', path => path.node.object.name === 'a');
  const [writeA, writeB, writeC] = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  function neverRuns(write) {
    const before = decisions();
    const dead = writeNeverRuns({ write, usagePath: read, adapter });
    return { dead, decisions: decisions() - before };
  }
  return { adapter, decisions, read, writeA, writeB, writeC, neverRuns };
}

// While A is being settled, C reads a cached B which itself depends on A.
// Once A returns, C can be kept only if every guard stayed open, as the cut assumed.
const TRANSITIVE = 'let a = Array; let b = Map; let c = Promise;\n'
  + 'if (!b) if (!c) a = Shim; if (!a) b = Shim2; if (!b) c = Shim3;\n'
  + 'export const r = a.from(list); export const s = c.resolve(1);';
for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) {
  const label = `${ parser.name }/${ method }/transitive`;
  const fresh = cycleProbe(parser, method, TRANSITIVE);
  const expected = fresh.neverRuns(fresh.writeC);
  check(`${ label }/fresh decision`, expected.dead, method === 'usage-pure');
  const { writeA, writeC, neverRuns } = cycleProbe(parser, method, TRANSITIVE);
  neverRuns(writeA);
  const after = neverRuns(writeC);
  check(`${ label }/same decision after another read`, after.dead, expected.dead);
  check(`${ label }/only a changed hypothesis expires`, after.decisions > 0, method === 'usage-pure');
  check(`${ label }/independent decision is reused`, neverRuns(writeC).decisions, 0);
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
  // ... whose answer survives only when the completed cycle validated all its open-guard assumptions
  const second = neverRuns(writeB);
  check(`${ label }/the guards of the second write decide`, second.dead, method === 'usage-pure');
  check(`${ label }/a changed hypothesis settles afresh`, second.decisions, method === 'usage-pure' ? 1 : 0);
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

// Controlled dependencies isolate invalidation from the resolver: A asks B and C, B asks A, and C reads
// cached B. Any narrowed guard or assumption outside this cycle must expire both dependent answers.
function dependencyProbe(parser, options = {}) {
  const { changed = -1, fold = false, cut } = options;
  const program = parser.parseAndScope('let a, b, c; if (a) a = 1; if (b) b = 1; if (c) c = 1; export const r = a.x;');
  const writes = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  const hosts = parser.collectPaths(program, 'IfStatement').map(path => path.node);
  const read = parser.pickPath(program, 'MemberExpression');
  const counts = [0, 0, 0];
  const adapter = {
    decidedSelection() { return null; },
    settledSelection(host) {
      const index = hosts.indexOf(host);
      counts[index]++;
      if (index === 0) {
        ask(1);
        ask(2);
      } else if (index === 1) {
        if (cut === 'context') withReentrantQuestion(() => ask(0), 'root');
        else if (cut === 'adapter') ask(0, { ...adapter });
        else ask(0);
        switch (cut) {
          case 'cycle': cycleGuardHas(new Set([host]), host); break;
          case 'refusal': refuseReentry(); break;
          case 'depth': cutDeepWalk(); break;
          case 'served read': readDecidesWrite({ readNode: hosts[0].test, write: writes[0], usagePath: read, adapter }); break;
        }
      } else ask(1);
      if (index === options.throwAt) throw new Error('dependent abandoned');
      return index === changed ? { [fold ? 'fold' : 'skip']: 'consequent' } : null;
    },
  };
  function ask(index, host = adapter) {
    return writeNeverRuns({ write: writes[index], usagePath: read, adapter: host });
  }
  function readDecides(index) {
    return readDecidesWrite({ readNode: hosts[index].test, write: writes[index], usagePath: read, adapter });
  }
  return { ask, counts, readDecides };
}

for (const parser of adapters) {
  for (const changed of [-1, 0, 1, 2]) for (const fold of [false, true]) {
    const { ask, counts, readDecides } = dependencyProbe(parser, { changed, fold });
    const label = `${ parser.name }/dependency/${ changed }/${ fold }`;
    check(`${ label }/first verdict`, ask(0), changed === 0 && !fold);
    const before = counts[1] + counts[2];
    check(`${ label }/second verdict`, ask(1), changed === 1 && !fold);
    check(`${ label }/third verdict`, ask(2), changed === 2 && !fold);
    check(`${ label }/only unchanged cycles survive`, counts[1] + counts[2] > before, changed !== -1);
    check(`${ label }/the retained guard still owns its read`, readDecides(2), changed !== 2 || !fold);
  }
  for (const cut of ['context', 'adapter', 'cycle', 'refusal', 'depth', 'served read']) {
    const { ask, counts } = dependencyProbe(parser, { cut });
    ask(0);
    const before = counts[1] + counts[2];
    check(`${ parser.name }/${ cut }/unknown stays unknown`, ask(2), false);
    checkTruthy(`${ parser.name }/${ cut }/dependent expires`, counts[1] + counts[2] > before);
  }
  const options = { throwAt: 2 };
  const { ask, counts } = dependencyProbe(parser, options);
  throwsWith(`${ parser.name }/abandoned cycle`, () => ask(0), 'dependent abandoned');
  options.throwAt = -1;
  check(`${ parser.name }/retry after an abandoned dependent`, ask(0), false);
  check(`${ parser.name }/completed sibling was discarded`, counts[1], 2);
}

// Query order must not turn an ignored early read into a different decision later in the file.
const ORDERS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
for (const parser of adapters) for (const method of ['usage-pure', 'usage-global']) for (const order of ORDERS) {
  const { writeA, writeB, writeC, neverRuns, decisions } = cycleProbe(parser, method, TRANSITIVE);
  const writes = [writeA, writeB, writeC];
  const label = `${ parser.name }/${ method }/order ${ order }`;
  for (const index of order) check(`${ label }/verdict ${ index }`, neverRuns(writes[index]).dead, method === 'usage-pure');
  const before = decisions();
  for (const index of order) neverRuns(writes[index]);
  check(`${ label }/completed decisions are reused`, decisions(), before);
}

finish();
