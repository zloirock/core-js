import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref;
  const effects = [];
  _globalThis.box = [3, 4];
  let w;
  return _at(_ref = (w = _globalThis.window).box).call(_ref, 0);
}