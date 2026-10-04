import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A ternary arm extracts the constructor while keeping the assignment's realm value.
function read(enabled) {
  let C;
  const realm = enabled ? (C = _Promise, _globalThis) : null;
  return enabled ? [realm === _globalThis, typeof (C === _Promise ? _Promise$try : C.try)] : realm;
}
export const result = [read(true), read(false)];