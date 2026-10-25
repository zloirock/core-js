// Installs of one global, each under a test of that global, decide one another (`settleCensusWrites`): a test's
// answer reads every install's never-run answer. Settling them must take a bounded number of guard decisions per
// install, however they are spelled or framed: count the decisions one census settling makes over n installs and
// over 2n - settling every other install anew per order of asks multiplies the count by the installs per install
import { collectPrePassSites as collectBabelPrePassSites, createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { collectPrePassSites, createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { collectFileCensus } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer, settleCensusWrites } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { adapters, createChecker, resolvePure } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('census-settling-complexity');

function install(index, test = '!globalThis.Map') {
  return `function install${ index }() { if (${ test }) globalThis.Map = Shim${ index }; }`;
}

const ONE_FRAME_WRITES = [
  index => `if (typeof Map == 'undefined') globalThis.Map = Shim${ index };`,
  () => "if (typeof Map == 'undefined') delete globalThis.Map;",
  index => `if (typeof Map == 'undefined') [globalThis.Map] = [Shim${ index }];`,
];

// one write per index, and whether the global stays written: an install under a test the build cannot answer
// leaves every install of the global open
const SHAPES = {
  'one frame': { write: index => ONE_FRAME_WRITES[index % 3](index), written: false },
  frames: { write: index => install(index), written: false },
  'frames beside top-level deletes': {
    write: index => index % 2 ? "if (typeof Map == 'undefined') delete globalThis.Map;" : install(index),
    written: false,
  },
  'frames beside a destructured write': {
    write: index => index ? install(index) : 'function install0() { if (!globalThis.Map) [globalThis.Map] = [Shim0]; }',
    written: false,
  },
  'frames beside an open install': { write: index => install(index, index ? '!globalThis.Map' : '!globalThis.Map || flag'), written: true },
};

// the guard decisions settling the census of `installs` writes makes, cut short past `budget` - an unbounded
// settling must fail this suite, not hang it
function decisions(parser, shape, installs, budget = Infinity) {
  const writes = Array.from({ length: installs }, (_, index) => SHAPES[shape].write(index));
  const program = parser.parseAndScope(`${ writes.join('\n') }\nexport const grouped = Map.groupBy(list, key);`);
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  let mutated = null;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', resolvePure, getMutatedStatics: () => mutated,
  });
  mutated = (parser.name === 'babel'
    ? collectBabelPrePassSites(program, adapter, census)
    : collectPrePassSites({ ast: program.node, adapter, census, collectMutations: true })).mutated;
  let count = 0;
  const { decidedSelection } = adapter;
  adapter.decidedSelection = function (...args) {
    if (++count > budget) throw new RangeError('decision budget exceeded');
    return decidedSelection.apply(this, args);
  };
  try {
    settleCensusWrites({ mutatedSet: mutated, adapter });
    return { count, written: adapter.isMutatedStatic('globalThis', 'Map') };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return { count, written: null };
  }
}

for (const parser of adapters) for (const [shape, { written }] of Object.entries(SHAPES)) {
  const label = `${ parser.name }/${ shape }`;
  const short = decisions(parser, shape, 3);
  // twice the installs: a settling polynomial in them grows by a bounded factor, one per order of asks by hundreds
  const long = decisions(parser, shape, 6, short.count * 8);
  checkTruthy(`${ label }/decision counter control`, short.count > 0, `${ short.count } decisions`);
  checkTruthy(`${ label }/decisions stay polynomial in the installs`, long.written !== null, `${ short.count } -> past ${ short.count * 8 }`);
  check(`${ label }/3 installs`, short.written, written);
  check(`${ label }/6 installs`, long.written, written);
}

finish();
