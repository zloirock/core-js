import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const key = () => "resolve";
  return typeof ((null == _globalThis.window ? void 0 : _Promise)[key()], _Promise$resolve);
}