import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A computed LITERAL key registers like the plain form; a CALL-spelled computed key keeps its own slot verbatim (the call runs
// once in the residual) while its binding still names the global the bound identity callee hands back, and the SIBLING element
// narrows through its sound positional pairing; a slot write of ONE hint's global deopts only that alias - the sibling keeps
// folding.
const [{
  ['WeakSet']: WS
}, {
  Promise: PR
}] = [{
  WeakSet: _WeakSet
}, {
  Promise: _Promise
}];
export const viaComputedSibling = _Promise$allSettled([]);