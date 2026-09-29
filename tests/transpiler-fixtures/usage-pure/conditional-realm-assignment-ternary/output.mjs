import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A ternary arm extracts the constructor while keeping the assignment's realm value.
function read(enabled) {
  var _ref;
  let C;
  const realm = enabled ? (_ref = _globalThis, C = _Promise, _ref) : null;
  return enabled ? [realm === _globalThis, typeof (C === _Promise ? _Promise$try : C.try)] : realm;
}
export const result = [read(true), read(false)];