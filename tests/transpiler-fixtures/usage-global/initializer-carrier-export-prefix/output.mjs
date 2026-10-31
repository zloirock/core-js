import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// Exported extracted bindings share the prefix before their values.
export const {
  Array: {
    prototype: {
      at: method,
      includes: contains
    }
  }
} = (effect(), globalThis);