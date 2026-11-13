import "core-js/modules/es.global-this";
// Keep the source guard and distinguish realm values from user properties.
function inner() {
  return globalThis.lib;
}
function outer() {
  return inner();
}
export const r = outer().window.X;