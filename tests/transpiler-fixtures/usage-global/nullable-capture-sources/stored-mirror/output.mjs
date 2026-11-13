import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A retained store in a declaration still owes the source coercion.
// Global preserves the source; this row guards the injection surface.
let held;
export const {
  resolve: {
    length
  }
} = (held = globalThis.window)?.Promise;