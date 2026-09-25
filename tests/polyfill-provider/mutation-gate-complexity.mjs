// The coarse mutation gate closes alias chains by NAME: a function whose local is spelled like the
// next function's parameter chains the two, so N such functions make one chain N names long. The
// closure is counted in global-object probes instead of timed - one per name a closure takes in - and
// a walk that rebuilt and rescanned the chain below every hop grows with the cube of the chain
import { createChecker } from './harness.mjs';
import { collectFileCensus, POSSIBLE_GLOBAL_OBJECTS } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { checkTruthy, finish, runBoth } = createChecker('mutation-gate-complexity');

const counts = new Map();
for (const [shape, hop] of [
  ['plain alias', k => `n${ k }`],
  ['member alias', k => `n${ k }.x`],
]) for (const size of [16, 32, 64]) {
  const functions = Array.from({ length: size }, (unused, k) => `function f${ k }(n${ k }) { const n${ k + 1 } = ${ hop(k) }; n${ k + 1 }.k${ k } = Map; return n${ k + 1 }; }`);
  runBoth(`${ shape } chain/${ size }`, functions.join('\n'), (parser, program, label) => {
    let probes = 0;
    POSSIBLE_GLOBAL_OBJECTS.has = function (value) {
      probes++;
      return Set.prototype.has.call(this, value);
    };
    try {
      collectFileCensus(program.node, [mutationShapesReducer()]);
    } finally {
      delete POSSIBLE_GLOBAL_OBJECTS.has;
    }
    // every write's receiver closes over the chain below it: a gate that stopped walking is fast for free
    checkTruthy(`${ label }: ${ probes } probes read the chain`, probes >= size);
    counts.set(`${ parser.name }/${ shape }/${ size }`, probes);
  });
}
// doubling the chain at most quadruples the probes: each write takes in every name below it once
for (const series of new Set(counts.keys().map(key => key.slice(0, key.lastIndexOf('/'))))) {
  for (const [small, large] of [[16, 32], [32, 64]]) {
    const ratio = counts.get(`${ series }/${ large }`) / counts.get(`${ series }/${ small }`);
    checkTruthy(`${ series }: ${ small } -> ${ large } functions grows the probes ${ ratio.toFixed(1) }x, at most 5x`, ratio <= 5);
  }
}
finish();
