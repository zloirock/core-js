import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A plain read through an absent realm alias must still throw.
// Global preserves the source; this row guards the injection surface.
const held = globalThis.window;
export const {
  resolve,
  unknown: {
    value
  } = {}
} = held.Promise;