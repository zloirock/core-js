import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
// A captured parameter keeps the type of its constructor default.
// The outer read uses the Map prototype, while the leaf keeps its array fallback.
function f(_ref = new _Map()) {
  var _ref2;
  let at = _at((_ref2 = _ref.keys) === void 0 ? [] : _ref2);
  return at;
}
f();