import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _self from "@core-js/pure/actual/self";
// a proxy-global HOP receiver (`globalThis.self.Array`) for a symbol-iterator + static-sibling
// destructure: the memoized receiver must COLLAPSE the redundant `self` hop to `_globalThis.Array`
// (the same collapse the retained-residual path applies) - `_globalThis.self.Array` would read `.Array`
// off a runtime-undefined `_globalThis.self` on ie:11 / Node
const _ref = _self.Array;
const it = _getIteratorMethod(_ref);
const from = _Array$from;
it;
from([1]);
export { it, from };