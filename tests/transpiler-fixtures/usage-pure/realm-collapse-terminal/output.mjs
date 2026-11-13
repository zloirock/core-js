import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return typeof (null == (_pushMaybeArray(effects).call(effects, "prefix"), _globalThis.window) ? void 0 : _self);
}