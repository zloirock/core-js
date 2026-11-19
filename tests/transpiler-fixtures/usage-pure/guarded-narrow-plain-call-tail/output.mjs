import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A plain call inside a guarded chain must still throw for a missing method.
let R = _globalThis;
if (_globalThis.__flag !== false) R = {
  Map: {}
};
export const read = () => null == R ? void 0 : (R === _globalThis ? _Map : R.Map).groupBy([1], x => x);