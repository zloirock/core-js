import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  var _ref, _ref2;
  const effects = [];
  _globalThis.self = choice ? {
    box: [7]
  } : null;
  let w;
  return null == (_ref = (w = _globalThis.window).self) ? void 0 : _at(_ref2 = _ref.box).call(_ref2, 0);
}