import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A guarded argument with a stored base keeps its methods and nullish branch.
// Global preserves the source; this row guards the injection surface.
let held;
export const result = (({
  resolve
}) => resolve)((held = globalThis.window)?.Promise);