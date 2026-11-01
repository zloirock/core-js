import "core-js/modules/es.object.to-string";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Excluded statics keep both sides of the served function-name read.
// Capturing the receiver must not batch its residual keys ahead of the claim.
const {
  Array: {
    from,
    name,
    of
  }
} = globalThis;
use(from, name, of);
export {};