import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A call observing the assignment result still follows the source nullish check.
let from, of;
export const value = consume({
  from,
  of
} = globalThis.window?.Array);
export { from, of };