import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// the guard test's carve asks by SHAPE whether a claim is the read the TEST performs, and a memo
// carries the source's own chain into that test whole. past the chain MARKER the claim is the
// source's read again, so the realm-hop collapse it takes unguarded is the one it takes here
let n = 0;
_globalThis.markerBox = {
  list: [[1]]
};
const provenRoot = () => _globalThis;
const provenProbe = () => _globalThis.window;

// the memo holds the source's chain: the run collapses onto the root ponyfill, marker or not
export const memoCarriedChain = null == (_ref = _globalThis.markerBox) ? void 0 : _at(_ref).call(_ref, 0);
export const memoCarriedChainDeep = null == (_ref2 = _globalThis.markerBox.list) ? void 0 : _flatMaybeArray(_ref2).call(_ref2);
export const memoCarriedSeqRoot = null == (_ref3 = (n++, _globalThis).markerBox) ? void 0 : _at(_ref3).call(_ref3, 0);
// NEGATIVE: the same nav with no guard to mint - the collapse the rows above have to match
export const unguardedTwin = _globalThis.markerBox.list;
// NEGATIVE: a probe-yielding root's `?.` is load-bearing, so the test IS the read the render
// performs and the hops below it fold onto the tested value
export const probeYieldTest = null == provenProbe() ? void 0 : _self.markerBox.list;
export { n };