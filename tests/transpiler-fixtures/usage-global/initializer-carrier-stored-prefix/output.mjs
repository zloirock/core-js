import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
// A kept store owns its RHS effects before the extracted read.
let held;
const {
  Array: {
    prototype: {
      at: method
    }
  }
} = held = (effect(), globalThis);
use(held, method);