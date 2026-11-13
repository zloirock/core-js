import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// Both synth bindings retain the throwing alias read.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window;
export const result = (({
  resolve
}) => resolve)(held.Promise);