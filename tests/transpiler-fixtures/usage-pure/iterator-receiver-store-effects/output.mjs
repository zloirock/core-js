import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref;
  const effects = [];
  _globalThis.box = [3];
  let w;
  return (_at(_ref = (_pushMaybeArray(effects).call(effects, "prefix"), w = _globalThis.window, null == w ? null.self : w)[_pushMaybeArray(effects).call(effects, "key"), "box"]) || 0).call(_ref, (_pushMaybeArray(effects).call(effects, "arg"), 0));
}