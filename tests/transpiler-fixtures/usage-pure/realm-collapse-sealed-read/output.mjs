import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return typeof (null == _globalThis.window ? void 0 : _Promise)[_pushMaybeArray(effects).call(effects, "key"), "noSuchStatic"];
}