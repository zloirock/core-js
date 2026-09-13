import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// Two guaranteed realm operands preserve the selected Promise static surface.
// The resolve call needs its static entry, including when native Promise is absent.
export const result = (globalThis && globalThis).Promise.resolve(1);