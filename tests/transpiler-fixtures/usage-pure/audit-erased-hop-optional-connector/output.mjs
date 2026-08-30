import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// the collapse erases an alias hop and re-hangs its optional connector onto what follows. only a
// dot, a computed key or a call continues a chain there.
// a MEMBER read past a wrapper that closes right after the erased hop is deliberately absent: that
// read observes the sealed value and must throw on a nullish root, and both emitters currently let
// it run. the fuzzer row that pins the divergence lives in the differential corpus - a baseline
// here would record the missing throw as the answer

// a CALL past the seal takes the full connector - the source short-circuits the call away on a
// nullish root, so dropping it would call an undefined value instead
let called;
export const callPastSeal = (null == (called = _globalThis.window) ? void 0 : _self)(1);

// UNSEALED controls - the chain does continue, and the connector is re-hung on each shape
let dotted;
export const dottedContinuation = null == (dotted = _globalThis.window) ? void 0 : _atMaybeArray(_ref = _Array$of(1)).call(_ref, 0);
let computed;
export const computedContinuation = null == (computed = _globalThis.window) ? void 0 : _atMaybeArray(_ref2 = _Array$of(2)).call(_ref2, 0);