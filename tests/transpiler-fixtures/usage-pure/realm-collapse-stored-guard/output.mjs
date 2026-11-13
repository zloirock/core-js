import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  let held;
  const d = delete (held = _globalThis.window)?.slotD;
  return [d, typeof held];
}