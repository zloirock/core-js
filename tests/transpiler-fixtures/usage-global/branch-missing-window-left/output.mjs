import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// An absent bare window keeps its ReferenceError before the member read.
// A present operand selects the realm and still needs the Promise polyfill.
export const size = (window && globalThis).Promise.length;