import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// THREE optional levels in one chain: `arr.flat?.().map(x=>x).filter?.().reduce?.(...)`.
// the chain emit at the OUTERMOST polyfilled call (`.reduce?.()` in this shape) must
// `markIntermediateChainHops` through .filter, .filter?.() OptCall, .map and .map(...) Call
// so the visitor doesn't queue duplicate chain emits at each polyfilled intermediate.
// .reduce isn't optional-callable as outermost here so chain emit fires for `.filter+.flat?.()`
const arr = [1, 2];
(null == arr || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref2 = _ref.call(arr))?.call(_ref2)).reduce?.((a: number, b: number) => a + b, 0).toString();