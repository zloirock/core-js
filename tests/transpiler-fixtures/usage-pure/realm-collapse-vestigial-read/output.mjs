import _globalThis from "@core-js/pure/actual/global-this";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const g = _globalThis;
  return null == g.window ? void 0 : _Reflect.slot;
}