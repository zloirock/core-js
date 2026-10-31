import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// Prefix evaluation remains conditional in a bodyless declaration.
if (condition) var {
  Array: {
    prototype: {
      at: method,
      includes: contains
    }
  }
} = (effect(), globalThis);
use(method, contains);