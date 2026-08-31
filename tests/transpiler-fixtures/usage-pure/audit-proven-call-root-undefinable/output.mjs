import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// proving WHICH global a call root yields is not proving it yields a DEFINED one: a body that
// navigates to the environment probe is undefined off-window, so a `?.` over such a call is
// load-bearing. erased, the collapse read the ponyfill where the source short-circuits - and the
// plan built on that root rendered a test that dereferences the probe
let n = 0,
  w;
_globalThis.callRootBox = {
  list: [[1]]
};
const provenProbe = () => _globalThis.window;
const provenRoot = () => _globalThis;

// the `?.` sits directly over the call: it is the only guard the source has
export const probeCallOptional = null == provenProbe() ? void 0 : _self.callRootBox.list;
export const probeCallSealed = (null == provenProbe() ? void 0 : _self).callRootBox;
export const probeCallDispatch = null == (_ref = null == provenProbe() ? void 0 : _self.callRootBox.list) ? void 0 : _flatMaybeArray(_ref).call(_ref);
// a body that short-circuits internally reaches the same verdict through one test
export const shortCircuitBody = null == (() => null == _globalThis.window ? void 0 : _self)() ? void 0 : _Promise$resolve(4);
// NEGATIVE: the call yields the always-defined root, so its `?.` is dead text and the nav collapses
export const definedCallRoot = _self.callRootBox.list;
// NEGATIVE: a PLAIN read off the probe-yielding call throws natively, and erasing that throw is the
// ordinary collapse - the guard question is only about a `?.` the emit would drop
export const plainReadOffCall = _self.Array?.prototype;
// a SEALED live `?.` over a kept write: the write stores the probe, so the test is the write itself
export const sealedKeptWrite = null == (w = _globalThis.window) ? void 0 : _Promise$resolve(1);
export const sealedKeptWriteSeq = (n++, null == (w = _globalThis.window) ? void 0 : _Array$of(5));
// NEGATIVE: the write stores the always-defined root, so the source of undefined is the hop ABOVE it
// and the test keeps that read (`null == (held = _globalThis).window`)
let held;
export const writeStoresRoot = null == (_ref2 = null == (held = (n++, _globalThis)).window ? void 0 : _self.callRootBox.list) ? void 0 : _flatMaybeArray(_ref2).call(_ref2);
export { n, w, held };

// the probe-yield DECOMPOSITION: one test, sourced from the call itself, and the realm hops
// fold onto the tested value - never a nested guard-value memo with its own leaf import.
// static tail, instance tail (the memo takes the CALL: `_ref = provenProbe()`), a value read
// (the alternate folds `.window` onto the substituted realm leaf), and the seq-prefixed twins
// whose buried effects ride the memo exactly once, in source order
export const probeYieldStaticTail = null == provenProbe() ? void 0 : _Array$of(1);
export const probeYieldChainTail = null == provenProbe() ? void 0 : _atMaybeArray(_ref3 = _Array$of(1)).call(_ref3, 0);
export const probeYieldInstanceTail = null == (_ref4 = null == provenProbe() ? void 0 : _self.callRootBox.list) ? void 0 : _at(_ref4).call(_ref4, 0);
export const probeYieldValueRead = null == provenProbe() ? void 0 : _self.Array;
export const probeYieldSeqNested = null == (n++, n++, provenProbe()) ? void 0 : _atMaybeArray(_ref5 = _Array$of(2)).call(_ref5, 0);
export const probeYieldSeqArg = null == (n++, provenProbe(n++)) ? void 0 : _atMaybeArray(_ref6 = _Array$of(3)).call(_ref6, 0);