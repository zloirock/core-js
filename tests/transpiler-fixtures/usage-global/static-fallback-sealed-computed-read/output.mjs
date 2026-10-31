import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// A sealed optional receiver must throw after evaluating the surviving key.
// The optional call cannot swallow the member read, and its argument stays skipped.
export const value = (globalThis.window?.Promise)[key(), "noSuchStatic"]?.(argument());