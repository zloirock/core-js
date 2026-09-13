import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A selected terminal window can be absent even when the other arm names the realm.
// Keep that value and its throwing read; provide Promise for a selected realm.
export function read(flag) {
  var _ref;
  let held;
  return (_ref = flag ? held = _globalThis.window : _globalThis, _ref === _globalThis ? _Promise : _ref.Promise).length;
}