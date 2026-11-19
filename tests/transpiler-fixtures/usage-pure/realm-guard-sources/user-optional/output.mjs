import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
function get() {
  return _globalThis.lib;
}
export const r = get()?.self?.Array.from([3]);