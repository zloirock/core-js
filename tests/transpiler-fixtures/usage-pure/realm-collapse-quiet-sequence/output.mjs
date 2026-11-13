import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete (0, _globalThis.window)?.slotD;
}