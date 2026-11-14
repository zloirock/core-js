import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let held;
  return (_pushMaybeArray(effects).call(effects, "prefix"), held = _globalThis.window)?.[_pushMaybeArray(effects).call(effects, "key"), "box"];
}