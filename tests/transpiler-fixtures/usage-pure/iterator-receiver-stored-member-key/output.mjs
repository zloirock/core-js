import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref;
  const effects = [];
  _globalThis.box = [3];
  const box = {};
  return _at(_ref = function (value) {
    return null == value ? null.self : value;
  }(box.w = _globalThis.window)[_pushMaybeArray(effects).call(effects, "key"), "box"]).call(_ref, 0);
}