import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// Both the instance method and retained length read the stored user's list.
let held;
export const {
  at,
  length
} = (held = globalThis.host).self.list;
export { held };