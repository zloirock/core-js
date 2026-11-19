import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref, _ref2;
  const effects = [];
  _globalThis.box = [3, 4];
  Array.prototype.extra = 1;
  const key = _joinMaybeArray(_ref = ["b", "o", "x"]).call(_ref, "");
  let w;
  return _at(_ref2 = (w = _globalThis.window, null == w ? null.self : w)[key]).call(_ref2, 0);
}