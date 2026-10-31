import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
export function noAlternate(flag) {
  var _ref;
  if (flag) {
    var L = _globalThis;
  }
  return _ref = L.Object, _ref === Object ? _Object$assign({}, {
    b: 2
  }) : _ref.assign({}, {
    b: 2
  });
}