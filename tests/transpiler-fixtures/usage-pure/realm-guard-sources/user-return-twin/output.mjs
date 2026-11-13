import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
function inner() {
  return _globalThis.lib;
}
function outer() {
  return inner();
}
export const r = outer().window.X;