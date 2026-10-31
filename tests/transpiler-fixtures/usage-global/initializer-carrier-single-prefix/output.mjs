import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// A sole nested receiver carries the initializer prefix exactly once.
const {
  Array: {
    prototype: {
      at: method
    }
  }
} = (effect(), globalThis);
use(method);