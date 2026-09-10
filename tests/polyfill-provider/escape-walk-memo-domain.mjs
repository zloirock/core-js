// The escape walk's CACHING layer as a domain of its own: the slot memo, the per-name root cache
// and the state one file's escapes share. A cache is supposed to leave the ANSWER alone, so no row
// about which node carries a stamp can see it - what it owes instead is TERMINATION and a SOUND
// key, and both of those turn into answers on the right shape. A walk that cannot converge spends
// its step ceiling on the cycle and every item queued behind it goes unstamped; a key that folds
// two different reads onto one entry hands the second read the first one's values, and a root
// replayed without the visited set it was derived under descends past its own cycle guard.
// Three of the four sources below spell a CIRCULAR alias graph, which is what a bundler's hoisted
// output produces and what `tsc` answers TS7022 to - the circularity is the point, and none of
// these sources is executed
import { createChecker, findNode } from './harness.mjs';
import {
  collectFileCensus,
  ESCAPED_CTOR_REFS,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkTruthy, finish, runBoth } = createChecker('escape-walk-memo-domain');

// --- Convergence and key soundness ---

// each row: the source, and the spellings whose own span must carry an escape stamp once the walk
// has converged. every row hands out a pair - one value the walk reaches only AFTER it is done with
// the shape the cache exists for, so a cache that stops folding starves the second half
const ROWS = [
  // a cycle whose every hop is a node the SOURCE spells: two containers reading each other's slot.
  // both keys fold it, which is what separates this row from the next one - the node is stable, so
  // identity dedup answers here exactly like the read's name does
  {
    name: 'a cycle spelled through source nodes converges, and the escape queued behind it stamps',
    code: [
      'var a = { p: b.q };',
      'var b = { q: a.p };',
      'var later = Map;',
      'hand([later, a.p]);',
    ].join('\n'),
    stamped: ['Map'],
  },
  // ... and the same cycle through slots a destructure SYNTHESIZES: the read a receiver-shaped
  // source pairs with is a new node every pass, so identity can never fold it and only the name
  // the read stands for - the root's position plus the key path - converges
  {
    name: 'a cycle through synthesized receiver reads converges on the name the read stands for',
    code: [
      'var { p } = boxA.inner;',
      'var { q } = boxB.inner;',
      'var boxA = { inner: { p: q } };',
      'var boxB = { inner: { q: p } };',
      'var later = Map;',
      'hand([later, boxA.inner.p]);',
    ].join('\n'),
    stamped: ['Map'],
  },
  // two synthesized reads off ONE receiver node: the pair borrows its span, so the root position is
  // the same for both and only the key path tells `box.inner.A` from `box.inner.B`. a key without
  // it answers the second read with the first one's values, and the second slot is never followed
  {
    name: 'two slots off one receiver keep their own answers',
    code: [
      'const box = { inner: { A: Map, B: Set } };',
      'const { A, B } = box.inner;',
      'hand(A);',
      'hand(B);',
    ].join('\n'),
    stamped: ['Map', 'Set'],
  },
  // a root resolved once and read twice: the second read gets the cached values, and it has to get
  // the visited NAMES with them. Without them the descent walks back through the alias hop the root
  // resolution already crossed, lands on the container instead of the bare name, and reads a slot
  // this file does not hold as a hole of its own rather than the escape it is
  {
    name: 'a cached root replays the names its own resolution visited',
    code: [
      'var holder = { probe: 1, deep: alias };',
      'var alias = holder;',
      'hand([alias.probe, alias.deep.absent]);',
    ].join('\n'),
    stamped: ['alias.deep.absent'],
  },
];

// the span a spelling occupies in its own source. every spelling here is unique in its row, so an
// ambiguous one is an authoring mistake that fails rather than asserting about whichever came first
function spanKey(code, text, label) {
  const start = code.indexOf(text);
  checkTruthy(`${ label }: '${ text }' occurs exactly once`,
    start !== -1 && code.indexOf(text, start + 1) === -1);
  return `${ start }:${ start + text.length }`;
}

for (const row of ROWS) {
  runBoth(row.name, row.code, (adapter, programPath, label) => {
    const program = programPath.node;
    collectFileCensus(program, [escapedCtorReferencesReducer()]);
    const stamps = ESCAPED_CTOR_REFS.get(program);
    checkTruthy(`${ label }: census ran`, !!stamps);
    for (const spelling of row.stamped) {
      check(`${ label }: '${ spelling }' stamped`, stamps.has(spanKey(row.code, spelling, label)), true);
    }
  });
}

// --- Work bound ---

// the half no answer above can reach: the walk shares ONE state across every escape of a file, so
// the work a root costs is paid once however many reads name it. A state minted per escape answers
// identically - the cold path seeds the same visited set the cache replays - and the only thing
// that changes is how OFTEN the walk walks, which is what a minified bundle turns into hours. So
// this row counts instead: the alias hop the root resolution crosses reports every visit, and the
// count has to be the same for a file with one read and a file with sixteen
const ESCAPE_READS = 16;

function hopCounterSource(reads) {
  const escapes = [];
  for (let at = 0; at < reads; at++) escapes.push('hand(outer.held);');
  return ['const inner = { held: Map };', 'const outer = inner;', ...escapes].join('\n');
}

// the walk reads the hop's NAME once per resolution of the root it stands for, so the visit count
// is how many times that root was derived
function countHopVisits(program, label) {
  const hop = findNode(program, node => node.type === 'VariableDeclarator' && node.id?.name === 'outer')?.init;
  checkTruthy(`${ label }: the alias hop is in the tree`, !!hop);
  const spelled = hop.name;
  let visits = 0;
  Object.defineProperty(hop, 'name', {
    configurable: true,
    get() {
      visits++;
      return spelled;
    },
  });
  collectFileCensus(program, [escapedCtorReferencesReducer()]);
  return visits;
}

runBoth('a root is derived once per file, not once per escape', hopCounterSource(ESCAPE_READS),
  (adapter, programPath, label) => {
    const many = countHopVisits(programPath.node, label);
    const one = countHopVisits(adapter.parseAndScope(hopCounterSource(1)).node, label);
    // the comparison is a bound only while the walk actually crosses that hop: a shape it never
    // reaches counts zero for every read count, and the row would then pass on nothing
    checkTruthy(`${ label }: the counted hop is on the walk path`, one > 0);
    check(`${ label }: visits do not grow with the read count`, many, one);
  });

finish();
