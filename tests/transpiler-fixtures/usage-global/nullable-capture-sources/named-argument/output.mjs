import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The caller census and the direct IIFE keep the same source guard.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window?.Array;
function read({
  from
}) {
  return from;
}
export const result = read(held);