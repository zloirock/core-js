import "core-js/modules/es.global-this";
// Keep the source guard and distinguish realm values from user properties.
function get() {
  return globalThis.lib;
}
export const r = get().window.X;