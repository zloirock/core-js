import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// A local capture keeps its namespace and the adjacent intrinsic read.
export function read() {
  var _ref;
  let name, groupBy;
  const value = (_ref = _globalThis.zz || _Map, name = _nameMaybeFunction(_ref), {
    groupBy
  } = _ref, _ref);
  return [name, typeof groupBy, value === _Map];
}