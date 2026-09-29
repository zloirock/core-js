import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
var _ref;
// Capturing a selection keeps its static beside an intrinsic read and preserves the RHS identity.
let name, groupBy;
const value = (_ref = _globalThis.zz || _Map, name = _nameMaybeFunction(_ref), {
  groupBy
} = _ref, _ref);
export const result = [name, typeof groupBy, value === _Map];