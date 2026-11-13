import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete (_pushMaybeArray(effects).call(effects, "prefix"), _globalThis.window)?.slotD;
}