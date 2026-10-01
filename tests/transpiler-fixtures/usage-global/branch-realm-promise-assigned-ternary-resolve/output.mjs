import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A stored realm selected by a ternary keeps both the write and its Promise static.
// The resolve call injects its static entry rather than only the constructor.
let held;
export const result = (true ? held = globalThis : globalThis).Promise.resolve(2);
export { held };