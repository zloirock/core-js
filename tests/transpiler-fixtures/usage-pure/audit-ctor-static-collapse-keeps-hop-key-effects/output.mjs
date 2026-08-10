import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
var _ref, _ref2, _ref3, _ref4;
// a collapse that discards the hops below its leaf discards their computed keys too, so the
// effects buried in them re-emit with the leaf's own, in native order (root side first). the
// sequence-tail rebind cuts the same way. the last row has no hop key - it pins the plain shape
let u;
let g = 0;
let e = 0;
let c = 0;
export const belowLeaf = null == (_ref = u = _globalThis.window) ? void 0 : _toFixedMaybeNumber(_ref2 = (g++, _Number$MAX_SAFE_INTEGER)).call(_ref2, 2);
export const atLeaf = null == (_ref3 = u = _globalThis.window) ? void 0 : _toFixedMaybeNumber(_ref4 = (g++, _Number$MAX_SAFE_INTEGER)).call(_ref4, 2);
export const seTailHopKey = (e++, c++, _Map);
export const seTailPlain = (e++, _Map);