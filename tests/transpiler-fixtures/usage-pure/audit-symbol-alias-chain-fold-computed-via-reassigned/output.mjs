import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a PROVABLY-REASSIGNED key (unconditional dominating write) resolves to the reaching
// value - the write IS the runtime key, so the chain folds and the target engine gets its
// polyfill; the dead init never drives the fold
let kr = 'Array';
kr = 'Symbol';
const ReassignedSymbol = _Symbol;
const viaReassigned = _Symbol$iterator;
export const j = _getIteratorMethod([19, 20]);