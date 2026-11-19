import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
var G = _globalThis;
export function viaCtor(flag) {
  var _ref;
  if (flag) {
    var G = _globalThis;
  }
  return _ref = G.Array, _ref === Array ? _Array$from([2]) : _ref.from([2]);
}
export const c = [viaCtor(true)];