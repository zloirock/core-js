import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// An absent or falsy stored window keeps the original short-circuit value and failure.
// A truthy operand selects the realm, which still needs the Promise polyfill.
export function read() {
  var _ref;
  let held;
  return (_ref = (held = _globalThis.window) && _globalThis, _ref === _globalThis ? _Promise : _ref.Promise).length;
}